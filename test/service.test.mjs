import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
import WebTorrent from 'webtorrent';
import { byteRange, createService } from '../server.mjs';

test('intervalos HTTP, inclusive um byte, sufixo e intervalos inválidos', () => {
  assert.deepEqual(byteRange('bytes=0-0', 100), { start: 0, end: 0, status: 206 });
  assert.deepEqual(byteRange('bytes=-5', 100), { start: 95, end: 99, status: 206 });
  assert.deepEqual(byteRange('bytes=95-200', 100), { start: 95, end: 99, status: 206 });
  for (const range of ['bytes=100-', 'bytes=-0', 'bytes=10-1', 'bytes=0-1,2-3', 'invalid']) assert.throws(() => byteRange(range, 100), { status: 416 });
});

test('play baixa apenas o arquivo escolhido, continua sem player, retoma e reproduz offline', { timeout: 45000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-cache-test-'));
  const seedDir = join(directory, 'seed');
  const stateDir = join(directory, 'state');
  const media = randomBytes(512 * 1024 + 173);
  await mkdir(seedDir);
  await mkdir(join(stateDir, 'torrents'), { recursive: true });
  await writeFile(join(seedDir, 'episode.mp4'), media);
  await writeFile(join(seedDir, 'other.mp4'), randomBytes(2 * 1024 * 1024));
  const engineOptions = { dht: false, tracker: false, lsd: false, utp: false, natUpnp: false, natPmp: false };
  const seed = new WebTorrent(engineOptions);
  const torrent = await new Promise((done, reject) => { seed.once('error', reject); seed.seed(seedDir, { private: true, announce: [], pieceLength: 16384 }, done); });
  const fileIdx = torrent.files.findIndex(file => file.name === 'episode.mp4');
  const otherIndex = torrent.files.findIndex(file => file.name === 'other.mp4');
  assert.ok(fileIdx >= 0);
  await writeFile(join(stateDir, 'torrents', `${torrent.infoHash}.torrent`), torrent.torrentFile);
  let service;
  const upstream = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ streams: [{ name: 'Teste', infoHash: torrent.infoHash, fileIdx, behaviorHints: { filename: 'episode.mp4' } }] }));
  });
  await new Promise(done => upstream.listen(0, '127.0.0.1', done));
  const config = { host: '127.0.0.1', port: 0, baseUrl: 'http://127.0.0.1', language: 'pt-BR', token: 'test-token', cacheDir: join(directory, 'cache'), stateDir, maxCacheBytes: 16 * 1024 * 1024, minFreeBytes: 0, maintenanceIntervalMs: 100, sources: [{ name: 'Teste', manifestUrl: `http://127.0.0.1:${upstream.address().port}/manifest.json` }] };
  const newService = async () => {
    const client = new WebTorrent({ ...engineOptions, downloadLimit: 96 * 1024 });
    client.on('torrent', download => download.addPeer(`127.0.0.1:${seed.torrentPort}`));
    return createService(config, { client });
  };
  const waitFor = async predicate => {
    const until = Date.now() + 20000;
    while (!predicate()) { if (Date.now() > until) throw new Error('Tempo de download excedido.'); await delay(100); }
  };
  try {
    service = await newService();
    const streams = await (await fetch(`${config.baseUrl}/${config.token}/stream/series/tt123:1:2.json`)).json();
    assert.equal(streams.streams.length, 1);
    assert.equal(service.client.torrents.length, 0);
    assert.equal(service.listDownloads().length, 0);
    let url = streams.streams[0].url;
    const forged = await fetch(url.replace(/\/play\/[^/]+/, '/play/forged.invalid'));
    assert.equal(forged.status, 403);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get('content-length')), media.length);
    assert.equal(service.listDownloads().length, 0);
    const invalid = await fetch(url, { headers: { Range: `bytes=${media.length}-` } });
    assert.equal(invalid.status, 416);
    assert.equal(service.listDownloads().length, 0);
    const oneByte = await fetch(url, { headers: { Range: 'bytes=0-0' } });
    assert.equal(oneByte.status, 206);
    assert.deepEqual(Buffer.from(await oneByte.arrayBuffer()), media.subarray(0, 1));
    assert.equal(service.listDownloads().length, 1);
    const abort = new AbortController();
    const playing = await fetch(url, { signal: abort.signal });
    const reader = playing.body.getReader();
    await reader.read();
    abort.abort();
    await reader.cancel().catch(() => {});
    assert.equal(service.listDownloads()[0].status, 'downloading');
    const oldPort = new URL(config.baseUrl).port;
    await service.close();
    service = await newService();
    url = url.replace(`:${oldPort}/`, `:${new URL(config.baseUrl).port}/`);
    await waitFor(() => service.listDownloads()[0]?.status === 'complete');
    assert.deepEqual(await readFile(service.listDownloads()[0].path), media);
    const other = service.client.torrents[0].files.find(file => file.name === 'other.mp4');
    assert.equal(other.done, false);
    assert.ok(other.downloaded <= 32768, `Outro arquivo baixou ${other.downloaded} bytes`);
    await new Promise(done => seed.destroy(done));
    await service.close();
    service = await newService();
    const cached = await fetch(service.playURL({ infoHash: torrent.infoHash, fileIdx }), { headers: { Range: 'bytes=-32' } });
    assert.equal(cached.status, 206);
    assert.deepEqual(Buffer.from(await cached.arrayBuffer()), media.subarray(media.length - 32));
    assert.equal(service.listDownloads()[0].status, 'complete');
    await new Promise(done => upstream.close(done));
    const offlineStreams = await service.getStreams('series', 'tt123:1:2');
    assert.equal(offlineStreams.streams.length, 1);
    assert.match(offlineStreams.streams[0].name, /Em cache/);
    config.maxCacheBytes = media.length + 100;
    const overBudget = await fetch(service.playURL({ infoHash: torrent.infoHash, fileIdx: otherIndex }));
    assert.equal(overBudget.status, 507);
    assert.equal(service.listDownloads().length, 1);
  } finally {
    await service?.close();
    if (!seed.destroyed) await new Promise(done => seed.destroy(done));
    await new Promise(done => upstream.close(done));
    await rm(directory, { recursive: true, force: true });
  }
});
