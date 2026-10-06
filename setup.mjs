import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir, networkInterfaces } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languageCode } from './i18n.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
export async function prepareConfig(directory = root, stateDirectory) {
  let saved = {};
  try { saved = JSON.parse(await readFile(join(directory, 'config.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const addresses = Object.entries(networkInterfaces()).filter(([name]) => !name.startsWith('utun')).flatMap(([, list]) => list).filter(address => address.family === 'IPv4' && !address.internal);
  const address = addresses.find(item => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address))?.address || addresses[0]?.address;
  if (!saved.baseUrl && !address) throw new Error('Set baseUrl in config.json to the address reachable by your TV.');
  const config = { host: '0.0.0.0', port: 7810, cacheDir: join(homedir(), 'Movies', 'Stremio'), stateDir: join(directory, 'state'), maxCacheBytes: 100 * 2 ** 30, minFreeBytes: 10 * 2 ** 30, preventSleep: process.platform === 'darwin', autoDiscoverAddons: process.platform === 'darwin', addonRefreshMs: 60000, language: languageCode(Intl.DateTimeFormat().resolvedOptions().locale), sources: [], defaultTrackers: ['udp://tracker.opentrackr.org:1337/announce', 'udp://open.stealth.si:80/announce', 'udp://tracker.torrent.eu.org:451/announce'], ...saved };
  config.baseUrl ||= `http://${address}:${config.port}`;
  config.token ||= randomBytes(24).toString('hex');
  config.stateDir = resolve(stateDirectory || config.stateDir);
  config.cacheDir = resolve(config.cacheDir);
  config.language = languageCode(config.language);
  if (!/^https?:$/.test(new URL(config.baseUrl).protocol) || !/^[a-zA-Z0-9_-]{24,128}$/.test(config.token)) throw new Error('Use an HTTP(S) baseUrl and a private token with 24–128 letters, digits, underscores or hyphens.');
  await mkdir(config.stateDir, { recursive: true, mode: 0o700 });
  await writeFile(join(directory, 'config.json'), JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  await writeFile(join(config.stateDir, 'addon-url.txt'), `${config.baseUrl}/${config.token}/manifest.json\n`, { mode: 0o600 });
  await writeFile(join(config.stateDir, 'status-url.txt'), `${config.baseUrl}/${config.token}/\n`, { mode: 0o600 });
  return config;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = await prepareConfig();
  console.log(`Configuration ready. Start with npm start. Private addresses: ${config.stateDir}`);
}
