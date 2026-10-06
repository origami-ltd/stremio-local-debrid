import http from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm, statfs } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import WebTorrent from 'webtorrent';
import { createAddonSources, fetchAddonStreams } from './addons.mjs';
import { torrentDescriptor } from './torrents.mjs';
import { locales, languageCode, translation } from './i18n.mjs';
import { renderDashboard, renderGuide } from './ui.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const validHash = /^[a-f0-9]{40}$/i;
const videoExtension = /\.(mkv|mp4|m4v|avi|webm|mov|ts|m2ts)$/i;
const fault = (status, message) => Object.assign(new Error(message), { status });

export function byteRange(header, size) {
  if (!header) return { start: 0, end: size - 1, status: 200 };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) throw fault(416, 'invalidRange');
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) throw fault(416, 'invalidRange');
  return { start, end, status: 206 };
}

export async function createService(config, options = {}) {
  const cacheDir = resolve(config.cacheDir);
  const stateDir = resolve(config.stateDir || join(root, 'state'));
  await mkdir(cacheDir, { recursive: true, mode: 0o700 });
  await mkdir(join(stateDir, 'torrents'), { recursive: true, mode: 0o700 });
  const addonSources = await createAddonSources({ ...config, stateDir }, options.addons);
  const client = options.client || new WebTorrent({ utp: false, natUpnp: false, natPmp: false, maxConns: 80, uploadLimit: 1048576, seedOutgoingConnections: false });
  client.on('error', error => console.error('BitTorrent:', error.message));
  const entries = new Map();
  const jobs = new Map();
  let saving = Promise.resolve();
  let closing = false;
  let maintenanceRunning = false;
  let awake = null;
  const updateSleep = () => {
    if (process.platform !== 'darwin' || !config.preventSleep) return;
    const active = !closing && [...entries.values()].some(entry => entry.readers || Date.now() - entry.lastAccess < 60000 || [...entry.selected].some(index => !entry.torrent?.files[index]?.done));
    if (active && !awake) {
      const child = spawn('/usr/bin/caffeinate', ['-i', '-w', String(process.pid)], { stdio: 'ignore' });
      awake = child;
      child.on('error', error => console.error('Energia:', error.message));
      child.once('exit', () => { if (awake === child) awake = null; });
    } else if (!active && awake) { awake.kill(); awake = null; }
  };
  try {
    for (const job of JSON.parse(await readFile(join(stateDir, 'downloads.json'), 'utf8'))) {
      if (validHash.test(job.infoHash) && Number.isInteger(job.fileIdx) && job.fileIdx >= 0) jobs.set(`${job.infoHash}:${job.fileIdx}`, job);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const persist = () => {
    const content = JSON.stringify([...jobs.values()], null, 2);
    saving = saving.then(async () => {
      await writeFile(join(stateDir, 'downloads.json.tmp'), content, { mode: 0o600 });
      await rename(join(stateDir, 'downloads.json.tmp'), join(stateDir, 'downloads.json'));
    }).catch(error => console.error('Estado:', error.message));
    return saving;
  };
  const sign = payload => createHmac('sha256', config.token).update(payload).digest('base64url');
  const playURL = descriptor => {
    const payload = Buffer.from(JSON.stringify(descriptor)).toString('base64url');
    return `${config.baseUrl}/${config.token}/play/${payload}.${sign(payload)}/${encodeURIComponent(descriptor.filename || 'video')}`;
  };
  const decode = value => {
    if (value.length > 16384) throw fault(400, 'invalidSource');
    const [payload, signature] = value.split('.');
    const expected = Buffer.from(sign(payload || ''));
    const actual = Buffer.from(signature || '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw fault(403, 'invalidSource');
    const descriptor = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!validHash.test(descriptor.infoHash) || (descriptor.fileIdx != null && (!Number.isInteger(descriptor.fileIdx) || descriptor.fileIdx < 0))) throw fault(400, 'invalidTorrent');
    return descriptor;
  };
  const getEntry = async descriptor => {
    const hash = descriptor.infoHash.toLowerCase();
    if (entries.has(hash)) return entries.get(hash).ready;
    const entry = { infoHash: hash, selected: new Set(), readers: 0, lastAccess: Date.now(), torrent: null };
    entry.ready = (async () => {
      let torrentId;
      try { torrentId = await readFile(join(stateDir, 'torrents', `${hash}.torrent`)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      torrentId ||= `magnet:?xt=urn:btih:${hash}`;
      const announce = [...new Set([...(descriptor.private ? [] : config.defaultTrackers || []), ...(descriptor.sources || []).filter(source => /^tracker:(https?|udp|wss?):\/\//.test(source)).map(source => source.slice(8))])];
      const torrent = client.add(torrentId, { path: join(cacheDir, hash), deselect: true, announce, urlList: descriptor.webSeeds, private: descriptor.private, strategy: 'sequential', destroyStoreOnDestroy: false });
      entry.torrent = torrent;
      torrent.on('error', error => {
        for (const job of jobs.values()) if (job.infoHash === hash) { job.status = 'error'; job.error = error.message; }
        entries.delete(hash);
        void persist();
        console.error('Torrent:', error.message);
      });
      await new Promise((done, reject) => {
        const timer = setTimeout(() => reject(fault(504, 'metadataTimeout')), config.metadataTimeoutMs || 90000);
        const cleanup = () => { clearTimeout(timer); torrent.off('error', failed); torrent.off('ready', ready); };
        const failed = error => { cleanup(); reject(error); };
        const ready = () => { cleanup(); done(); };
        torrent.once('error', failed);
        torrent.once('ready', ready);
        if (torrent.ready) ready();
      });
      for (const file of torrent.files) {
        if (!resolve(cacheDir, hash, file.path).startsWith(join(cacheDir, hash) + sep)) throw fault(400, 'unsafePath');
      }
      await writeFile(join(stateDir, 'torrents', `${hash}.torrent`), torrent.torrentFile, { mode: 0o600 });
      return entry;
    })().catch(async error => {
      entries.delete(hash);
      if (entry.torrent && !entry.torrent.destroyed) await new Promise(done => client.remove(entry.torrent, { destroyStore: false }, () => done()));
      throw error;
    });
    entries.set(hash, entry);
    return entry.ready;
  };
  const allocated = () => [...jobs.values()].reduce((total, job) => total + (job.length || 0), 0);
  const freeSpace = async () => { const disk = await statfs(cacheDir); return disk.bavail * disk.bsize; };
  const evict = async (extraBytes, exclude) => {
    let free = await freeSpace();
    const candidates = [...new Set([...jobs.values()].filter(job => job.status === 'complete' && job.infoHash !== exclude).sort((a, b) => a.lastAccess - b.lastAccess).map(job => job.infoHash))];
    for (const hash of candidates) {
      if (allocated() + extraBytes <= config.maxCacheBytes && free >= extraBytes + config.minFreeBytes) break;
      const related = [...jobs.values()].filter(job => job.infoHash === hash);
      const entry = entries.get(hash);
      if (entry?.readers || (entry && Date.now() - entry.lastAccess < 60000) || related.some(job => job.status !== 'complete')) continue;
      if (entry?.torrent && !entry.torrent.destroyed) await new Promise(done => client.remove(entry.torrent, { destroyStore: false }, () => done()));
      entries.delete(hash);
      await rm(join(cacheDir, hash), { recursive: true, force: true });
      for (const job of related) jobs.delete(`${hash}:${job.fileIdx}`);
      free = await freeSpace();
      await persist();
    }
    if (allocated() + extraBytes > config.maxCacheBytes || free < extraBytes + config.minFreeBytes) throw fault(507, 'cacheFull');
  };
  let selection = Promise.resolve();
  const selectFile = async (descriptor, download) => {
    const entry = await getEntry(descriptor);
    const operation = selection.then(async () => {
      entry.lastAccess = Date.now();
      const torrent = entry.torrent;
      const file = descriptor.fileIdx == null
        ? torrent.files.filter(file => videoExtension.test(file.name) && !/\bsample\b/i.test(file.name)).sort((a, b) => b.length - a.length)[0]
        : torrent.files[descriptor.fileIdx];
      if (!file || file.length === 0) throw fault(404, 'missingVideo');
      const fileIdx = torrent.files.indexOf(file);
      if (download) {
        const key = `${entry.infoHash}:${fileIdx}`;
        const existing = jobs.get(key);
        if (!existing) await evict(file.length, entry.infoHash);
        else if (!file.done && await freeSpace() < config.minFreeBytes) throw fault(507, 'noDisk');
        const job = { ...existing, ...descriptor, infoHash: entry.infoHash, fileIdx, filename: file.name, path: join(cacheDir, entry.infoHash, file.path), length: file.length, lastAccess: Date.now(), error: undefined, status: file.done ? 'complete' : 'downloading' };
        jobs.set(key, job);
        if (!entry.selected.has(fileIdx)) { file.select(); entry.selected.add(fileIdx); }
        updateSleep();
        await persist();
      }
      return { entry, file };
    });
    selection = operation.catch(() => {});
    return operation;
  };
  const listDownloads = () => [...jobs.values()].map(job => {
    const entry = entries.get(job.infoHash);
    const file = entry?.torrent?.files[job.fileIdx];
    const downloaded = file?.done || job.status === 'complete' ? job.length : Math.max(0, file?.downloaded || 0);
    return { filename: job.filename, status: file?.done ? 'complete' : job.status, bytes: job.length, downloaded, progress: job.length ? downloaded / job.length : 0, peers: entry?.torrent?.numPeers || 0, speed: entry?.torrent?.downloadSpeed || 0, path: job.path, error: job.error };
  });
  const defaults = translation(config.language);
  const manifest = { id: 'local.stremio.cache', version: '1.2.0', name: defaults.name, description: defaults.description, logo: `${config.baseUrl}/${config.token}/assets/logo.png`, resources: ['stream'], types: ['movie', 'series', 'anime', 'other'], catalogs: [], behaviorHints: { configurable: true, p2p: true } };
  const getStreams = async (type, id, language = config.language) => {
    const t = translation(language);
    const stored = [...jobs.values()].filter(job => job.type === type && job.id === id && job.status === 'complete').map(job => {
      const descriptor = { infoHash: job.infoHash, fileIdx: job.fileIdx, sources: job.sources, webSeeds: job.webSeeds, private: job.private, filename: job.filename, type, id };
      return { name: `${t.name} ✓\n${t.cached}`, description: job.filename, url: playURL(descriptor), behaviorHints: { notWebReady: true, filename: job.filename, videoSize: job.length, bingeGroup: 'cache-local-stored' } };
    });
    const sources = await addonSources.forRequest(type, id);
    const results = await Promise.allSettled(sources.map(async source => {
      const data = await fetchAddonStreams(source, type, id);
      const converted = await Promise.all(data.map(async stream => {
        const torrent = await torrentDescriptor(stream, stateDir);
        if (!torrent) return null;
        const descriptor = { ...torrent, type, id };
        const cached = [...jobs.values()].some(job => job.infoHash === descriptor.infoHash && (descriptor.fileIdx == null || descriptor.fileIdx === job.fileIdx) && job.status === 'complete');
        return { name: `${t.name} ${cached ? '✓' : '↓'}\n${stream.name || source.name}`, description: stream.description || stream.title || source.name, url: playURL(descriptor), subtitles: stream.subtitles, behaviorHints: { notWebReady: true, filename: descriptor.filename, videoHash: stream.behaviorHints?.videoHash, videoSize: stream.behaviorHints?.videoSize, bingeGroup: `cache-local-${stream.behaviorHints?.bingeGroup || source.name}` } };
      }));
      return converted.filter(Boolean);
    }));
    const streams = [...stored];
    const seen = new Map(stored.map(stream => { const descriptor = decode(stream.url.split('/play/')[1].split('/')[0]); return [`${descriptor.infoHash}:${descriptor.fileIdx ?? -1}`, stream]; }));
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') { console.error('Fonte indisponível:', sources[index].name); continue; }
      for (const stream of result.value) {
        const descriptor = decode(stream.url.split('/play/')[1].split('/')[0]);
        const key = `${descriptor.infoHash}:${descriptor.fileIdx ?? -1}`;
        const previous = seen.get(key);
        if (!previous) { seen.set(key, stream); streams.push(stream); }
        else {
          const previousDescriptor = decode(previous.url.split('/play/')[1].split('/')[0]);
          previous.url = playURL({ ...previousDescriptor, sources: [...new Set([...(previousDescriptor.sources || []), ...descriptor.sources])], webSeeds: [...new Set([...(previousDescriptor.webSeeds || []), ...(descriptor.webSeeds || [])])], private: previousDescriptor.private || descriptor.private });
        }
      }
    }
    return { streams, cacheMaxAge: 30, staleRevalidate: 0, staleError: 0 };
  };
  const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
  const server = http.createServer(async (req, res) => {
    let t = translation(config.language);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    try {
      const requestURL = new URL(req.url, config.baseUrl);
      const path = requestURL.pathname.split('/').filter(Boolean);
      if (path[0] !== config.token) throw fault(404, 'notFound');
      const prefixLanguage = locales[path[1]] ? path.splice(1, 1)[0] : null;
      const language = languageCode(requestURL.searchParams.get('lang') || prefixLanguage || config.language || req.headers['accept-language']);
      t = translation(language);
      if (!['GET', 'HEAD'].includes(req.method)) throw fault(405, 'invalidMethod');
      if (path[1] === 'manifest.json') { json(res, 200, { ...manifest, name: t.name, description: t.description, types: [...new Set([...manifest.types, ...addonSources.status().sources.flatMap(source => source.types)])] }); return; }
      if (path[1] === 'downloads.json') { json(res, 200, { downloads: listDownloads(), cacheBytes: allocated(), cacheLimitBytes: config.maxCacheBytes }); return; }
      if (path[1] === 'sources.json') { await addonSources.refresh(); json(res, 200, addonSources.status()); return; }
      if (path[1] === 'stream' && path.length === 4 && path[3].endsWith('.json')) { json(res, 200, await getStreams(decodeURIComponent(path[2]), decodeURIComponent(path[3].slice(0, -5)), language)); return; }
      if (path[1] === 'assets' && ['logo.png', 'icon.svg', 'style.css'].includes(path[2]) && path.length === 3) {
        res.writeHead(200, { 'Content-Type': path[2].endsWith('.png') ? 'image/png' : path[2].endsWith('.svg') ? 'image/svg+xml' : 'text/css; charset=utf-8', 'Cache-Control': 'private, max-age=3600' });
        res.end(await readFile(join(root, 'public', 'assets', path[2])));
        return;
      }
      if (path[1] === 'play' && path[2]) {
        const descriptor = decode(path[2]);
        const { entry, file } = await selectFile(descriptor, false);
        let range;
        try { range = byteRange(req.headers.range, file.length); }
        catch (error) { res.setHeader('Content-Range', `bytes */${file.length}`); throw error; }
        if (res.destroyed) return;
        if (req.method === 'GET') await selectFile(descriptor, true);
        res.setHeader('Content-Type', file.type);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`);
        res.setHeader('Cache-Control', 'private, max-age=0');
        if (range.status === 206) res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${file.length}`);
        res.writeHead(range.status);
        if (req.method === 'HEAD') { res.end(); return; }
        entry.readers++;
        const reader = file.createReadStream({ start: range.start, end: range.end });
        const stop = () => reader.destroy();
        res.once('close', stop);
        try {
          await pipeline(Readable.from((async function* () {
            let remaining = range.end - range.start + 1;
            for await (const chunk of reader) {
              const part = chunk.subarray(0, remaining);
              remaining -= part.length;
              yield part;
              if (!remaining) break;
            }
          })()), res);
        } catch (error) { if (!res.destroyed) throw error; }
        finally { res.off('close', stop); reader.destroy(); entry.readers--; entry.lastAccess = Date.now(); }
        return;
      }
      if (path.length === 1 || path[1] === 'configure' || path[1] === 'guide') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(path[1] === 'guide' ? renderGuide(config, language) : renderDashboard(config, language, listDownloads(), addonSources.status(), allocated()));
        return;
      }
      throw fault(404, 'notFound');
    } catch (error) {
      if (!res.headersSent && !res.destroyed) json(res, error.status || 502, { error: t.errors[error.message] || error.message });
      else if (!res.destroyed) res.destroy();
    }
  });
  const maintenance = async () => {
    if (maintenanceRunning || closing) return;
    maintenanceRunning = true;
    try {
      let changed = false;
      for (const [hash, entry] of entries) {
        if (!entry.torrent?.ready || entry.torrent.destroyed) continue;
        for (const index of entry.selected) {
          const file = entry.torrent.files[index];
          const job = jobs.get(`${hash}:${index}`);
          if (job && file.done && job.status !== 'complete') { job.status = 'complete'; delete job.error; changed = true; }
        }
        const complete = [...entry.selected].every(index => entry.torrent.files[index].done);
        if (!entry.readers && complete && Date.now() - entry.lastAccess > (config.idleReleaseMs || 60000)) {
          await new Promise(done => client.remove(entry.torrent, { destroyStore: false }, () => done()));
          entries.delete(hash);
        }
      }
      if (changed) await persist();
      if (await freeSpace() < config.minFreeBytes) {
        try { await evict(0); }
        catch {
          for (const [hash, entry] of entries) {
            if (!entry.torrent || entry.torrent.destroyed) continue;
            for (const job of jobs.values()) if (job.infoHash === hash && job.status !== 'complete') { job.status = 'error'; job.error = 'noDisk'; }
            await new Promise(done => client.remove(entry.torrent, { destroyStore: false }, () => done()));
            entries.delete(hash);
          }
          await persist();
        }
      }
    } finally { maintenanceRunning = false; updateSleep(); }
  };
  const timer = setInterval(() => void maintenance().catch(error => console.error('Cache:', error.message)), config.maintenanceIntervalMs || 5000);
  timer.unref();
  await new Promise((done, reject) => { server.once('error', reject); server.listen(config.port, config.host, done); });
  if (config.port === 0) config.baseUrl = `http://${config.host}:${server.address().port}`;
  for (const job of jobs.values()) {
    if (job.status === 'downloading') void selectFile(job, true).catch(error => { job.status = 'error'; job.error = error.message; void persist(); });
  }
  return { server, client, manifest, playURL, getStreams, listDownloads, maintenance, addonSources, async close() {
    closing = true;
    updateSleep();
    clearInterval(timer);
    await addonSources.close();
    server.closeAllConnections();
    await new Promise(done => server.close(done));
    await new Promise(done => client.destroy(done));
    await saving;
  } };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
  const service = await createService(config);
  console.log(`Cache Local disponível em ${config.baseUrl}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void service.close().then(() => process.exit(0)));
}
