import test from 'node:test';
import assert from 'node:assert/strict';
import WebTorrent from 'webtorrent';
import { createService } from '../server.mjs';
import { syntheticTorrent, workspace, cacheTorrent, engineOptions, serviceConfig, harmlessHTML } from '../features/security-hardening/repro/fixtures.mjs';

const mediaTypes = [
  ['.mp4', 'video/mp4'], ['.m4v', 'video/mp4'], ['.mkv', 'video/x-matroska'],
  ['.avi', 'video/x-msvideo'], ['.webm', 'video/webm'], ['.mov', 'video/quicktime'],
  ['.ts', 'video/mp2t'], ['.m2ts', 'video/mp2t']
];

function assertBrowserProtection(response, playback = true) {
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  if (playback) {
    const policy = response.headers.get('content-security-policy') || '';
    assert.match(policy, /(?:^|;)\s*sandbox\s*(?:;|$)/);
    assert.match(policy, /(?:^|;)\s*default-src 'none'\s*(?:;|$)/);
    assert.match(policy, /(?:^|;)\s*media-src 'self'\s*(?:;|$)/);
    assert.ok(!/allow-scripts|allow-same-origin|unsafe-inline/.test(policy));
  }
}

async function fixture(t) {
  const space = await workspace();
  const client = new WebTorrent(engineOptions);
  let service;
  t.after(async () => {
    try {
      if (service) await service.close();
      else if (!client.destroyed) await new Promise(done => client.destroy(done));
    } finally { await space.close(); }
  });
  const config = serviceConfig(space);
  service = await createService(config, { client });
  return {
    service, config,
    async add(name, data) {
      const torrent = syntheticTorrent(name, data);
      await cacheTorrent(space, torrent);
      return (descriptor = {}) => service.playURL({ infoHash: torrent.infoHash, ...descriptor });
    },
    request(url, options = {}) { return fetch(url, { ...options, signal: AbortSignal.timeout(10000) }); }
  };
}

test('playback rejects explicit active/nonmedia files before creating download jobs', { timeout: 30000 }, async t => {
  const f = await fixture(t);
  for (const name of ['payload.html', 'payload.svg', 'payload.xhtml', 'payload.js', 'payload.mp4.html', 'payload.txt']) {
    const url = await f.add(name, harmlessHTML);
    for (const method of ['HEAD', 'GET']) {
      const response = await f.request(url({ fileIdx: 0, filename: 'claimed-video.mp4' }), { method });
      assert.equal(response.status, 404, `${name} (${method})`);
      assert.match(response.headers.get('content-type'), /^application\/json/);
      assertBrowserProtection(response);
      const body = await response.text();
      if (method === 'GET') assert.equal(typeof JSON.parse(body).error, 'string');
      else assert.equal(body, '');
      assert.ok(!body.includes('<script>'));
      assert.equal(f.service.listDownloads().length, 0);
    }
  }
  const noVideo = await f.add('no-video.html', harmlessHTML);
  const response = await f.request(noVideo());
  assert.equal(response.status, 404);
  assertBrowserProtection(response);
  await response.arrayBuffer();
});

test('supported explicit and automatic selections use controlled media types and preserve ranges', { timeout: 30000 }, async t => {
  const f = await fixture(t);
  const bytes = Buffer.from('synthetic media bytes for range assertions');
  for (const [extension, type] of mediaTypes) {
    const url = await f.add(`fixture${extension.toUpperCase()}`, bytes);
    for (const descriptor of [{}, { fileIdx: 0 }]) {
      const head = await f.request(url(descriptor), { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get('content-type'), type);
      assert.equal(Number(head.headers.get('content-length')), bytes.length);
      assertBrowserProtection(head);
      assert.equal(await head.text(), '');
    }
    // The dependency's mutable MIME field must not decide the HTTP content type.
    f.service.client.torrents.at(-1).files[0].type = 'text/html';
    const partial = await f.request(url({ fileIdx: 0, filename: 'misleading.html' }), { headers: { Range: 'bytes=0-0' } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-type'), type);
    assert.equal(partial.headers.get('content-range'), `bytes 0-0/${bytes.length}`);
    assertBrowserProtection(partial);
    assert.deepEqual(Buffer.from(await partial.arrayBuffer()), bytes.subarray(0, 1));
    const suffix = await f.request(url({ fileIdx: 0 }), { headers: { Range: 'bytes=-5' } });
    assert.equal(suffix.status, 206);
    assertBrowserProtection(suffix);
    assert.deepEqual(Buffer.from(await suffix.arrayBuffer()), bytes.subarray(-5));
  }
});

test('HTML disguised as video stays a sandboxed media response, including ranged requests', { timeout: 15000 }, async t => {
  const f = await fixture(t);
  const url = await f.add('disguised.mp4', harmlessHTML);
  for (const headers of [{}, { Range: 'bytes=0-100' }]) {
    const response = await f.request(url({ fileIdx: 0 }), { headers });
    assert.equal(response.status, headers.Range ? 206 : 200);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assertBrowserProtection(response);
    const body = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(body, headers.Range ? harmlessHTML.subarray(0, 101) : harmlessHTML);
  }
  // This asserts HTTP protections, not a browser engine's script-execution behavior.
});

test('playback errors retain browser protections; protected pages suppress referrers', { timeout: 15000 }, async t => {
  const f = await fixture(t);
  const url = await f.add('fixture.mp4', Buffer.from('range fixture'));
  for (const [target, options, status] of [
    [url(), { headers: { Range: 'bytes=999-' } }, 416],
    [url({ fileIdx: 99 }), {}, 404],
    [url().replace(/\/play\/[^/]+/, '/play/forged.invalid'), {}, 403]
  ]) {
    const response = await f.request(target, options);
    assert.equal(response.status, status);
    assertBrowserProtection(response);
    assert.match(response.headers.get('content-type'), /^application\/json/);
    await response.arrayBuffer();
  }
  for (const suffix of ['', '/configure', '/guide']) {
    const response = await f.request(`${f.config.baseUrl}/${f.config.token}${suffix}`);
    assert.equal(response.status, 200);
    assertBrowserProtection(response, false);
    assert.match(response.headers.get('content-type'), /^text\/html/);
    // The strict playback sandbox is not applied to dashboard styles/navigation.
    assert.equal(response.headers.get('content-security-policy'), null);
    await response.arrayBuffer();
  }
});
