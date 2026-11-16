import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createService } from '../server.mjs';

test('streaming-only: pausa, riavvio e ripresa', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'streaming-only-'));
  const infoHash = 'a'.repeat(40);
  const config = {
    host: '127.0.0.1',
    port: 0,
    baseUrl: 'http://127.0.0.1',
    token: 'test-token',
    language: 'en-US',
    cacheDir: join(dir, 'cache'),
    stateDir: join(dir, 'state'),
    maxCacheBytes: 1024 * 1024,
    minFreeBytes: 0,
    sources: [],
    streamingOnly: true,
    streamingIdleMs: 20,
    maintenanceIntervalMs: 60000
  };

  class FakeClient extends EventEmitter {
    torrents = [];

    add() {
      const torrent = new EventEmitter();
      Object.assign(torrent, {
        ready: true,
        destroyed: false,
        torrentFile: Buffer.from('test'),
        files: [{
          name: 'clip.mp4',
          path: 'clip.mp4',
          type: 'video/mp4',
          length: 1024,
          done: false,
          downloaded: 512,
          select() {},
          createReadStream() {
            return Readable.from([Buffer.from('x')]);
          }
        }]
      });
      this.torrents.push(torrent);
      return torrent;
    }

    remove(torrent, options, done) {
      torrent.destroyed = true;
      this.torrents = this.torrents.filter(t => t !== torrent);
      done();
    }

    destroy(done) { done(); }
  }

  let service;
  const start = () => createService(config, {
    client: new FakeClient()
  });

  const play = async () => {
    const url = service.playURL({ infoHash, fileIdx: 0 });
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' }
    });
    assert.equal(response.status, 206);
    await response.arrayBuffer();
  };

  try {
    service = await start();
    await play();
    assert.equal(service.listDownloads()[0].status, 'downloading');

    await delay(100);
    await service.maintenance();

    assert.equal(service.client.torrents.length, 0);
    assert.equal(service.listDownloads()[0].status, 'paused');
    assert.equal(service.listDownloads()[0].downloaded, 512);

    const saved = JSON.parse(await readFile(
      join(config.stateDir, 'downloads.json'), 'utf8'
    ));
    assert.equal(saved[0].status, 'paused');
    assert.equal(saved[0].downloaded, 512);

    await service.close();
    service = null;

    service = await start();
    assert.equal(service.client.torrents.length, 0);
    assert.equal(service.listDownloads()[0].status, 'paused');
    assert.equal(service.listDownloads()[0].downloaded, 512);

    await play();
    assert.equal(service.client.torrents.length, 1);
    assert.equal(service.listDownloads()[0].status, 'downloading');
  } finally {
    await service?.close();
    await rm(dir, { recursive: true, force: true });
  }
});
