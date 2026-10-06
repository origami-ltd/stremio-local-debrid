import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
import WebTorrent from 'webtorrent';
import { readStremioProfile } from '../addons.mjs';
import { createService } from '../server.mjs';

const engineOptions = { dht: false, tracker: false, lsd: false, utp: false, natUpnp: false, natPmp: false };
const descriptor = stream => JSON.parse(Buffer.from(stream.url.split('/play/')[1].split('.')[0], 'base64url').toString());

test('lê o perfil WebKit sem alterar o banco ou carregar outros dados da conta', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-profile-test-'));
  const storage = join(directory, 'origin', 'origin', 'LocalStorage');
  await mkdir(storage, { recursive: true });
  const path = join(storage, 'localstorage.sqlite3');
  const db = new DatabaseSync(path);
  const addons = [{ transportUrl: 'https://example.test/configured/manifest.json', manifest: { id: 'test.addon', name: 'Test', resources: ['stream'], types: ['movie'] } }];
  db.exec('CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value BLOB)');
  db.prepare('INSERT INTO ItemTable VALUES (?, ?)').run('profile', Buffer.from(JSON.stringify({ auth: { key: 'test-session', email: 'private@example.test' }, addons, settings: { private: true } }), 'utf16le'));
  db.close();
  try {
    const before = await readFile(path);
    assert.deepEqual(await readStremioProfile(directory), { authKey: 'test-session', addons });
    assert.deepEqual(await readFile(path), before);
    assert.equal(await readStremioProfile(join(directory, 'missing')), null);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('sincroniza todos os addons, preserva configuração, filtra streams e acompanha instalação e remoção', { timeout: 10000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-discovery-test-'));
  const seed = new WebTorrent(engineOptions);
  const torrent = await new Promise((done, reject) => { seed.once('error', reject); seed.seed(Buffer.from('synthetic video'), { name: 'test.mp4', private: true, announce: ['udp://private.example.test:80/announce'] }, done); });
  const hashA = 'a'.repeat(40);
  const hashB = 'b'.repeat(40);
  const requests = [];
  let installed = [];
  let apiOnline = true;
  const upstream = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/addons') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      assert.equal(JSON.parse(Buffer.concat(chunks)).authKey, 'test-session');
      res.statusCode = apiOnline ? 200 : 503;
      res.end(JSON.stringify({ result: { addons: installed } }));
      return;
    }
    requests.push(url.pathname);
    if (url.pathname === '/sample.torrent') { res.end(torrent.torrentFile); return; }
    if (url.pathname === '/configured/private-config/stream/movie/tt123.json') {
      assert.equal(url.searchParams.get('setting'), 'preserved');
      res.end(JSON.stringify({ streams: [
        { name: 'Configured', infoHash: hashA, fileIdx: 0, sources: ['tracker:udp://one.example.test:80/announce'] },
        { url: 'https://example.test/video.mp4' }, { externalUrl: 'https://example.test/watch' }, { ytId: 'video' }, { infoHash: 'invalid' }, { infoHash: hashB, fileIdx: -1 }
      ] }));
      return;
    }
    if (url.pathname === '/second/stream/movie/tt123.json') {
      res.end(JSON.stringify({ streams: [
        { name: 'Second', infoHash: hashA, fileIdx: 0, sources: ['tracker:udp://two.example.test:80/announce'] },
        { url: `magnet:?xt=urn:btih:${hashB}&dn=episode.mp4&tr=udp%3A%2F%2Fmagnet.example.test%3A80%2Fannounce&ws=http%3A%2F%2Fexample.test%2Fseed`, fileIdx: 1 },
        { url: `${base}/sample.torrent` }, { infoHash: 'A'.repeat(32) }
      ] }));
      return;
    }
    if (url.pathname === '/legacy/stremio/v1/q.json') {
      const rpc = JSON.parse(Buffer.from(url.searchParams.get('b'), 'base64'));
      assert.equal(rpc.method, 'stream.find');
      assert.deepEqual(rpc.params[1].query, { type: 'series', imdb_id: 'tt123', season: 2, episode: 3 });
      res.end(JSON.stringify({ result: [{ infoHash: hashB, fileIdx: 2 }] }));
      return;
    }
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise(done => upstream.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${upstream.address().port}`;
  const addon = (name, path, resources = ['stream'], types = ['movie']) => ({ transportUrl: `${base}${path}`, manifest: { id: `test.${name}`, name, resources, types } });
  const first = addon('Configured', '/configured/private-config/manifest.json?setting=preserved');
  const second = addon('Second', '/second/manifest.json', [{ name: 'stream', types: ['movie'] }]);
  second.manifest.idPrefixes = ['custom:'];
  const ignored = [addon('Subtitles', '/subtitles/manifest.json', ['subtitles']), addon('WrongType', '/series/manifest.json', ['stream'], ['series']), { ...addon('Self', '/self/manifest.json'), manifest: { id: 'local.stremio.cache', resources: ['stream'], types: ['movie'] } }, { ...addon('WrongPrefix', '/prefix/manifest.json'), manifest: { id: 'test.prefix', name: 'Prefix', resources: ['stream'], types: ['movie'], idPrefixes: ['custom:'] } }];
  installed = [first, ...ignored];
  const config = { host: '127.0.0.1', port: 0, baseUrl: 'http://127.0.0.1', token: 'cache-test-token', cacheDir: join(directory, 'cache'), stateDir: join(directory, 'state'), maxCacheBytes: 1024 * 1024, minFreeBytes: 0, autoDiscoverAddons: true, addonRefreshMs: 40, sources: [{ name: 'Old manual source', manifestUrl: `${base}/old/manifest.json` }] };
  const service = await createService(config, { client: new WebTorrent(engineOptions), addons: { readProfile: async () => ({ authKey: 'test-session', addons: [first, ...ignored] }), apiUrl: `${base}/api/addons` } });
  const waitFor = async predicate => {
    const until = Date.now() + 2000;
    while (!predicate()) { assert.ok(Date.now() < until, 'A lista não foi sincronizada'); await delay(10); }
  };
  try {
    let result = await service.getStreams('movie', 'tt123');
    assert.equal(result.streams.length, 1);
    assert.equal(descriptor(result.streams[0]).infoHash, hashA);
    assert.deepEqual(requests, ['/configured/private-config/stream/movie/tt123.json']);
    assert.equal(service.client.torrents.length, 0);
    installed = [first, second, ...ignored];
    await waitFor(() => service.addonSources.status().sources.some(source => source.name === 'Second'));
    result = await service.getStreams('movie', 'tt123');
    assert.equal(result.streams.length, 4);
    assert.deepEqual(descriptor(result.streams[0]).sources, ['tracker:udp://one.example.test:80/announce', 'tracker:udp://two.example.test:80/announce']);
    const magnet = result.streams.map(descriptor).find(item => item.infoHash === hashB);
    assert.deepEqual(magnet.sources, ['tracker:udp://magnet.example.test:80/announce']);
    assert.deepEqual(magnet.webSeeds, ['http://example.test/seed']);
    assert.equal(magnet.fileIdx, 1);
    const file = result.streams.map(descriptor).find(item => item.infoHash === torrent.infoHash);
    assert.equal(file.private, true);
    assert.deepEqual(await readFile(join(config.stateDir, 'torrents', `${torrent.infoHash}.torrent`)), Buffer.from(torrent.torrentFile));
    assert.equal(service.client.torrents.length, 0);
    assert.ok(result.streams.every(stream => stream.url.startsWith(`${config.baseUrl}/${config.token}/play/`)));
    const publicStatus = await (await fetch(`${config.baseUrl}/${config.token}/sources.json`)).text();
    assert.ok(!publicStatus.includes('private-config') && !publicStatus.includes('test-session'));
    const snapshot = await readFile(join(config.stateDir, 'installed-addons.json'), 'utf8');
    assert.ok(!snapshot.includes('test-session'));
    assert.equal((await stat(join(config.stateDir, 'installed-addons.json'))).mode & 0o777, 0o600);
    installed = [second, ...ignored];
    await waitFor(() => !service.addonSources.status().sources.some(source => source.name === 'Configured'));
    requests.length = 0;
    result = await service.getStreams('movie', 'tt123');
    assert.equal(result.streams.length, 4);
    assert.ok(!requests.some(path => path.includes('/configured/')));
    apiOnline = false;
    await service.addonSources.refresh(true);
    assert.equal((await service.getStreams('movie', 'tt123')).streams.length, 4);
    apiOnline = true;
    installed = [addon('Legacy', '/legacy/stremio/v1', ['stream'], ['series'])];
    await waitFor(() => service.addonSources.status().sources.some(source => source.name === 'Legacy'));
    result = await service.getStreams('series', 'tt123:2:3');
    assert.equal(descriptor(result.streams[0]).fileIdx, 2);
    installed = [];
    await waitFor(() => service.addonSources.status().sources.length === 0);
    assert.equal((await service.getStreams('movie', 'tt123')).streams.length, 0);
    assert.equal(service.listDownloads().length, 0);
  } finally {
    await service.close();
    await new Promise(done => upstream.close(done));
    await new Promise(done => seed.destroy(done));
    await rm(directory, { recursive: true, force: true });
  }
});
