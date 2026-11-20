import http from 'node:http';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Dependency-free fixture encoding, not an application torrent parser.
export function bencode(value) {
  if (Buffer.isBuffer(value)) return Buffer.concat([Buffer.from(`${value.length}:`), value]);
  if (typeof value === 'string') return bencode(Buffer.from(value));
  if (Number.isSafeInteger(value)) return Buffer.from(`i${value}e`);
  if (Array.isArray(value)) return Buffer.concat([Buffer.from('l'), ...value.map(bencode), Buffer.from('e')]);
  if (value && typeof value === 'object') return Buffer.concat([
    Buffer.from('d'),
    ...Object.keys(value).sort().flatMap(key => [bencode(key), bencode(value[key])]),
    Buffer.from('e')
  ]);
  throw new TypeError('Unsupported fixture value');
}

export function syntheticTorrent(name, content, extra = {}) {
  const data = Buffer.from(content);
  const pieces = [];
  for (let start = 0; start < data.length; start += 16384) {
    pieces.push(createHash('sha1').update(data.subarray(start, start + 16384)).digest());
  }
  const info = { name, length: data.length, 'piece length': 16384, pieces: Buffer.concat(pieces), private: 1 };
  return {
    name, data, info,
    infoHash: createHash('sha1').update(bencode(info)).digest('hex'),
    metadata: bencode({ ...extra, info })
  };
}

export const harmlessHTML = Buffer.from(`<!doctype html><meta charset="utf-8">
<title>M0 harmless browser fixture</title><p id="result">Script has not executed.</p>
<script>
document.documentElement.dataset.m0Executed = 'yes';
document.querySelector('#result').textContent = 'M0: inline script executed in the service origin.';
// No network calls, token display, storage changes or external resources.
</script>`);

export async function workspace() {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-m0-'));
  const stateDir = join(directory, 'state');
  const cacheDir = join(directory, 'cache');
  await mkdir(join(stateDir, 'torrents'), { recursive: true });
  await mkdir(cacheDir);
  return { directory, stateDir, cacheDir, async close() { await rm(directory, { recursive: true, force: true }); } };
}

export async function cacheTorrent(space, torrent) {
  const destination = join(space.cacheDir, torrent.infoHash);
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, torrent.name), torrent.data);
  await writeFile(join(space.stateDir, 'torrents', `${torrent.infoHash}.torrent`), torrent.metadata);
}

export async function localServer(handler, { host = '127.0.0.1', port = 0 } = {}) {
  const errors = [];
  const server = http.createServer((req, res) => {
    Promise.resolve().then(() => handler(req, res)).catch(error => {
      errors.push(error.message);
      if (!res.headersSent) res.writeHead(500);
      res.end('fixture error');
    });
  });
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(port, host, done);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`, errors,
    async close() { server.closeAllConnections(); await new Promise(done => server.close(done)); }
  };
}

export const engineOptions = { dht: false, tracker: false, lsd: false, utp: false, natUpnp: false, natPmp: false };

export function serviceConfig(space, sources = []) {
  return {
    host: '127.0.0.1', port: 0, baseUrl: 'http://127.0.0.1',
    token: 'm0-isolated-fixture-token', language: 'en-US',
    cacheDir: space.cacheDir, stateDir: space.stateDir,
    maxCacheBytes: 1024 * 1024, minFreeBytes: 0, sources
  };
}
