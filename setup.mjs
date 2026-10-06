import { randomBytes } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir, networkInterfaces } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languageCode } from './i18n.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
export async function loadConfig(directory = root) {
  let saved = {};
  try { saved = JSON.parse(await readFile(join(directory, 'config.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const addresses = Object.entries(networkInterfaces()).filter(([name]) => !name.startsWith('utun')).flatMap(([, list]) => list).filter(address => address.family === 'IPv4' && !address.internal);
  const address = addresses.find(item => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address))?.address || addresses[0]?.address;
  const config = { host: '0.0.0.0', port: 7810, cacheDir: join(homedir(), 'Movies', 'Stremio'), stateDir: join(directory, 'state'), maxCacheBytes: 100 * 2 ** 30, minFreeBytes: 10 * 2 ** 30, preventSleep: process.platform === 'darwin', autoDiscoverAddons: process.platform === 'darwin', addonRefreshMs: 60000, language: languageCode(Intl.DateTimeFormat().resolvedOptions().locale), sources: [], defaultTrackers: ['udp://tracker.opentrackr.org:1337/announce', 'udp://open.stealth.si:80/announce', 'udp://tracker.torrent.eu.org:451/announce'], ...saved };
  config.baseUrl ||= address ? `http://${address}:${config.port}` : '';
  config.token ||= randomBytes(24).toString('hex');
  config.language = languageCode(config.language);
  return config;
}

export async function prepareConfig(directory = root, stateDirectory, values = {}) {
  const config = { ...await loadConfig(directory), ...values };
  config.stateDir = resolve(directory, stateDirectory || config.stateDir);
  config.cacheDir = resolve(directory, config.cacheDir.startsWith('~/') || config.cacheDir.startsWith('~\\') ? join(homedir(), config.cacheDir.slice(2)) : config.cacheDir);
  config.language = languageCode(config.language);
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('Use a port between 1 and 65535.');
  if (!Number.isSafeInteger(config.maxCacheBytes) || config.maxCacheBytes <= 0 || !Number.isSafeInteger(config.minFreeBytes) || config.minFreeBytes < 0) throw new Error('Use a positive cache budget and a nonnegative free-space reserve.');
  if (!/^https?:$/.test(new URL(config.baseUrl).protocol) || !/^[a-zA-Z0-9_-]{24,128}$/.test(config.token)) throw new Error('Use an HTTP(S) baseUrl and a private token with 24–128 letters, digits, underscores or hyphens.');
  config.baseUrl = config.baseUrl.replace(/\/+$/, '');
  await mkdir(config.stateDir, { recursive: true, mode: 0o700 });
  await writeFile(join(directory, 'config.json'), JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  await writeFile(join(config.stateDir, 'addon-url.txt'), `${config.baseUrl}/${config.token}/manifest.json\n`, { mode: 0o600 });
  await writeFile(join(config.stateDir, 'status-url.txt'), `${config.baseUrl}/${config.token}/\n`, { mode: 0o600 });
  if (process.platform !== 'win32') for (const file of [join(directory, 'config.json'), join(config.stateDir, 'addon-url.txt'), join(config.stateDir, 'status-url.txt')]) await chmod(file, 0o600);
  return config;
}
