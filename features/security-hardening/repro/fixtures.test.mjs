import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { bencode, syntheticTorrent, workspace, cacheTorrent, harmlessHTML } from './fixtures.mjs';

test('fixture bencoding is canonical and includes piece boundaries in the info hash', () => {
  assert.equal(bencode({ z: [1, 'x'], a: Buffer.from([0]) }).toString(), 'd1:a1:\x001:zli1e1:xee');
  const content = Buffer.alloc(16385, 42);
  const torrent = syntheticTorrent('fixture.mp4', content);
  assert.equal(torrent.info.pieces.length, 40);
  assert.equal(torrent.infoHash, createHash('sha1').update(bencode(torrent.info)).digest('hex'));
  assert.deepEqual(torrent.info.pieces.subarray(0, 20), createHash('sha1').update(content.subarray(0, 16384)).digest());
  assert.deepEqual(torrent.info.pieces.subarray(20), createHash('sha1').update(content.subarray(16384)).digest());
  assert.equal(torrent.info.private, 1);
});

test('isolated cache fixture preserves bytes and removes its own temporary workspace', async () => {
  const space = await workspace();
  try {
    const torrent = syntheticTorrent('fixture.html', harmlessHTML);
    await cacheTorrent(space, torrent);
    assert.deepEqual(await readFile(join(space.cacheDir, torrent.infoHash, torrent.name)), harmlessHTML);
    assert.deepEqual(await readFile(join(space.stateDir, 'torrents', `${torrent.infoHash}.torrent`)), torrent.metadata);
  } finally { await space.close(); }
  await assert.rejects(access(space.directory), { code: 'ENOENT' });
});
