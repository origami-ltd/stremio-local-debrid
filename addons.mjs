import { createHash } from 'node:crypto';
import { readdir, stat, readFile, writeFile, rename } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const selfId = 'local.stremio.cache';
const streamResources = manifest => (manifest.resources || []).filter(resource => resource === 'stream' || resource?.name === 'stream').map(resource => typeof resource === 'string' ? { types: manifest.types, idPrefixes: manifest.idPrefixes } : resource);

export async function readStremioProfile(directory = join(homedir(), 'Library', 'WebKit', 'com.westbridge.stremio5-mac', 'WebsiteData', 'Default')) {
  let paths;
  try { paths = (await readdir(directory, { recursive: true })).filter(path => path.endsWith(join('LocalStorage', 'localstorage.sqlite3'))); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const files = await Promise.all(paths.map(async path => ({ path: join(directory, path), modified: (await stat(join(directory, path))).mtimeMs })));
  for (const file of files.sort((a, b) => b.modified - a.modified)) {
    let db;
    try {
      db = new DatabaseSync(file.path, { readOnly: true });
      const row = db.prepare("SELECT value FROM ItemTable WHERE key = 'profile'").get();
      if (!row) continue;
      const profile = JSON.parse(typeof row.value === 'string' ? row.value : Buffer.from(row.value).toString('utf16le'));
      if (Array.isArray(profile.addons)) return { authKey: profile.auth?.key, addons: profile.addons };
    } catch {}
    finally { db?.close(); }
  }
  return null;
}

function sourcesFrom(addons, config) {
  const seen = new Set();
  return addons.flatMap(addon => {
    const manifest = addon.manifest || { name: addon.name, resources: ['stream'], types: ['movie', 'series', 'anime', 'other'] };
    const transportUrl = addon.transportUrl || addon.manifestUrl;
    if (!transportUrl || manifest.id === selfId || !streamResources(manifest).length || seen.has(transportUrl)) return [];
    try {
      const url = new URL(transportUrl);
      const local = new URL(config.baseUrl);
      if (!['http:', 'https:'].includes(url.protocol) || url.pathname.startsWith(`/${config.token}/`) && url.port === local.port) return [];
      if (!/\/manifest\.json$|\/stremio\/v1(?:\/stremioget)?\/?$/.test(url.pathname)) return [];
    } catch { return []; }
    seen.add(transportUrl);
    return [{ name: manifest.name || addon.name || manifest.id || 'Torrent', manifest, manifestUrl: transportUrl }];
  });
}

export async function createAddonSources(config, options = {}) {
  const readProfile = options.readProfile || (() => readStremioProfile(config.stremioProfileDir));
  const request = options.fetch || fetch;
  const intervalMs = config.addonRefreshMs || 60000;
  const snapshotPath = join(config.stateDir, 'installed-addons.json');
  let sources = sourcesFrom(config.sources || [], config);
  let mode = 'manual';
  let account = null;
  let localSignature = null;
  let authKey;
  let refreshedAt = null;
  let lastAttempt = 0;
  let pending;
  let closed = false;
  const abort = new AbortController();
  if (config.autoDiscoverAddons) {
    try {
      const saved = JSON.parse(await readFile(snapshotPath, 'utf8'));
      if (Array.isArray(saved.addons)) { sources = sourcesFrom(saved.addons, config); account = saved.account; refreshedAt = saved.refreshedAt; mode = 'saved'; }
    } catch (error) { if (error.code !== 'ENOENT') console.error('Addons: não foi possível ler a lista salva.'); }
  }
  const loadLocal = async () => {
    if (!config.autoDiscoverAddons || closed) return;
    const profile = await readProfile();
    if (!profile) return;
    const nextAccount = profile.authKey ? createHash('sha256').update(profile.authKey).digest('hex') : null;
    const signature = createHash('sha256').update(JSON.stringify(profile.addons)).digest('hex');
    if (nextAccount !== account || localSignature && signature !== localSignature || mode === 'manual') {
      sources = sourcesFrom(profile.addons, config);
      mode = 'local';
      lastAttempt = 0;
      refreshedAt = null;
    }
    account = nextAccount;
    authKey = profile.authKey;
    localSignature = signature;
  };
  const refresh = (force = false) => {
    if (!config.autoDiscoverAddons || closed) return Promise.resolve();
    if (pending) return pending;
    pending = (async () => {
      await loadLocal();
      if (!authKey || !force && Date.now() - lastAttempt < intervalMs) return;
      lastAttempt = Date.now();
      const requestedAccount = account;
      const response = await request(options.apiUrl || 'https://api.strem.io/api/addonCollectionGet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'AddonCollectionGet', authKey, update: false }), signal: AbortSignal.any([abort.signal, AbortSignal.timeout(8000)]) });
      if (!response.ok) throw new Error('Falha ao sincronizar.');
      const data = await response.json();
      if (data.error || !Array.isArray(data.result?.addons)) throw new Error('Lista inválida.');
      if (closed || account !== requestedAccount) return;
      sources = sourcesFrom(data.result.addons, config);
      mode = 'account';
      refreshedAt = new Date().toISOString();
      await writeFile(`${snapshotPath}.tmp`, JSON.stringify({ account, addons: data.result.addons, refreshedAt }), { mode: 0o600 });
      await rename(`${snapshotPath}.tmp`, snapshotPath);
    })().catch(() => { if (!closed) console.error('Addons: sincronização indisponível; usando a última lista conhecida.'); }).finally(() => { pending = null; });
    return pending;
  };
  await loadLocal().catch(() => console.error('Addons: não foi possível ler o perfil local.'));
  void refresh();
  const timer = config.autoDiscoverAddons ? setInterval(() => void refresh(), intervalMs) : null;
  timer?.unref();
  return {
    refresh,
    async forRequest(type, id) {
      await refresh();
      return sources.filter(source => streamResources(source.manifest).some(resource => (!Array.isArray(resource.types) || resource.types.includes(type)) && (!Array.isArray(resource.idPrefixes) || resource.idPrefixes.some(prefix => id.startsWith(prefix)))));
    },
    status: () => ({ mode, refreshedAt, refreshSeconds: intervalMs / 1000, sources: sources.map(source => ({ id: source.manifest.id, name: source.name, types: [...new Set(streamResources(source.manifest).flatMap(resource => resource.types || []))] })) }),
    async close() { closed = true; clearInterval(timer); abort.abort(); await pending; }
  };
}

export async function fetchAddonStreams(source, type, id) {
  const url = new URL(source.manifestUrl);
  const legacy = /\/stremio\/v1(?:\/stremioget)?\/?$/.test(url.pathname);
  if (legacy) {
    const parts = id.split(':');
    const query = { type };
    const special = /^(tt|UC)/.test(id);
    query[parts[0].startsWith('tt') ? 'imdb_id' : parts[0].startsWith('UC') ? 'yt_id' : parts[0]] = special ? parts[0] : parts[1];
    const video = parts.slice(special ? 1 : 2);
    if (video.length === 2) { query.season = Number(video[0]); query.episode = Number(video[1]); }
    else if (video.length === 1) query.video_id = video[0];
    url.pathname = `${url.pathname.replace(/\/$/, '')}/q.json`;
    url.searchParams.set('b', Buffer.from(JSON.stringify({ params: [null, { query }], method: 'stream.find', id: 1, jsonrpc: '2.0' })).toString('base64'));
  } else url.pathname = url.pathname.replace(/\/manifest\.json$/, `/stream/${encodeURIComponent(type)}/${encodeURIComponent(id)}.json`);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (legacy && data.error) throw new Error('Resposta inválida.');
  const streams = legacy ? data.result : data.streams;
  return Array.isArray(streams) ? streams : [];
}
