import { mkdir, writeFile, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { prepareConfig } from './setup.mjs';
import { installStartup, stopStartup, runtimeDirectory } from './startup.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const runtime = runtimeDirectory();
const config = await prepareConfig(root, join(runtime, 'state'));
await mkdir(runtime, { recursive: true, mode: 0o700 });
await stopStartup(runtime);
for (const file of ['server.mjs', 'addons.mjs', 'torrents.mjs', 'i18n.mjs', 'ui.mjs', 'locales', 'public/assets', 'package.json', 'package-lock.json', 'node_modules']) await cp(join(root, file), join(runtime, file), { recursive: true });
await writeFile(join(runtime, 'config.json'), JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
await mkdir(join(root, 'state'), { recursive: true, mode: 0o700 });
for (const file of ['addon-url.txt', 'status-url.txt']) await cp(join(config.stateDir, file), join(root, 'state', file));
const startupFile = await installStartup(runtime);
let ready = false;
for (let attempt = 0; attempt < 80; attempt++) {
  try {
    const response = await fetch(`${config.baseUrl}/${config.token}/manifest.json`, { signal: AbortSignal.timeout(1000) });
    if (response.ok && (await response.json()).id === 'local.stremio.cache') { ready = true; break; }
  } catch {}
  await delay(250);
}
if (!ready) throw new Error(`The service did not respond. Startup configuration: ${startupFile}`);
console.log(`Local Cache started at ${config.baseUrl}`);
console.log(`Private addon address: ${join(config.stateDir, 'addon-url.txt')}`);
console.log(`Automatic startup: ${startupFile}`);
