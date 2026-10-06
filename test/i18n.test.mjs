import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createService } from '../server.mjs';
import { locales, languageCode, direction } from '../i18n.mjs';

test('language aliases and right-to-left layout', () => {
  assert.equal(languageCode('pt_PT'), 'pt-PT');
  assert.equal(languageCode('unknown, zh-HK;q=0.9'), 'zh-HK');
  assert.equal(languageCode('de-AT'), 'de-DE');
  assert.equal(languageCode('unknown'), 'en-US');
  for (const code of Object.keys(locales)) assert.equal(direction(code), /^(ar|fa|he|ur)-/.test(code) ? 'rtl' : 'ltr');
});

test('all locale manifests, guides, errors and stream labels work over HTTP without starting downloads', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-languages-'));
  const upstream = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ streams: [{ infoHash: 'a'.repeat(40), fileIdx: 0, name: 'Upstream', title: '<file>' }] }));
  });
  await new Promise(done => upstream.listen(0, '127.0.0.1', done));
  const client = new EventEmitter();
  client.torrents = [];
  client.destroy = done => done();
  client.add = () => assert.fail('Listing sources must not start a torrent.');
  const config = { host: '127.0.0.1', port: 0, baseUrl: 'http://127.0.0.1', token: 'synthetic-public-test-token', language: 'pt-BR', cacheDir: join(directory, 'cache'), stateDir: join(directory, 'state'), maxCacheBytes: 2 ** 30, minFreeBytes: 0, sources: [{ manifestUrl: `http://127.0.0.1:${upstream.address().port}/manifest.json` }] };
  const service = await createService(config, { client });
  const base = `${config.baseUrl}/${config.token}`;
  try {
    for (const [code, t] of Object.entries(locales)) {
      const manifestResponse = await fetch(`${base}/${code}/manifest.json`);
      const manifest = await manifestResponse.json();
      assert.equal(manifest.id, 'local.stremio.cache');
      assert.equal(manifest.name, t.name);
      assert.equal(manifest.description, t.description);
      assert.equal(manifestResponse.headers.get('access-control-allow-origin'), '*');
      const dashboard = await (await fetch(`${base}/${code}/configure`)).text();
      assert.ok(dashboard.includes(`lang="${code}" dir="${direction(code)}"`));
      assert.ok(dashboard.includes(`stremio://${new URL(config.baseUrl).host}/${config.token}/${code}/manifest.json`));
      const guide = await (await fetch(`${base}/${code}/guide`)).text();
      assert.ok(guide.includes('npm run install:service'));
      const method = await fetch(`${base}/${code}/manifest.json`, { method: 'POST' });
      assert.equal(method.status, 405);
      assert.equal((await method.json()).error, t.errors.invalidMethod);
      const streams = await (await fetch(`${base}/${code}/stream/movie/tt123.json`)).json();
      assert.equal(streams.streams.length, 1);
      assert.equal(streams.streams[0].name, `${t.name} ↓\nUpstream`);
    }
    assert.equal((await (await fetch(`${base}/manifest.json`)).json()).name, locales['pt-BR'].name);
    assert.equal((await (await fetch(`${base}/manifest.json?lang=ja-JP`)).json()).name, locales['ja-JP'].name);
    assert.equal((await fetch(`${config.baseUrl}/wrong-token/manifest.json`)).status, 404);
    assert.equal((await fetch(`${base}/assets/../config.json`)).status, 404);
    assert.equal((await fetch(`${base}/manifest.json`, { method: 'OPTIONS' })).status, 204);
    assert.equal(service.listDownloads().length, 0);
  } finally {
    await service.close();
    await new Promise(done => upstream.close(done));
    await rm(directory, { recursive: true, force: true });
  }
});
