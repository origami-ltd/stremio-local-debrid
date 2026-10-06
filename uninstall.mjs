import { rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { runtimeDirectory } from './startup.mjs';

const execute = (file, args) => execFileSync(file, args, { stdio: 'inherit', windowsHide: true });
if (process.platform === 'darwin') {
  try { execute('launchctl', ['bootout', `gui/${process.getuid()}/local.stremio.cache`]); } catch {}
  await rm(join(homedir(), 'Library', 'LaunchAgents', 'local.stremio.cache.plist'), { force: true });
} else if (process.platform === 'linux') {
  execute('systemctl', ['--user', 'disable', '--now', 'stremio-local-debrid.service']);
  await rm(join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'systemd', 'user', 'stremio-local-debrid.service'), { force: true });
  execute('systemctl', ['--user', 'daemon-reload']);
} else if (process.platform === 'win32') {
  const script = join(runtimeDirectory(), 'uninstall-startup.ps1');
  await writeFile(script, "$ErrorActionPreference = 'Stop'\n$task = Get-ScheduledTask -TaskName 'Stremio Local Debrid' -ErrorAction SilentlyContinue\nif ($task) { $task | Stop-ScheduledTask; $task | Unregister-ScheduledTask -Confirm:$false }\n");
  execute('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script]);
} else {
  throw new Error(`Automatic startup is unsupported on ${process.platform}.`);
}
console.log('Automatic startup removed. Configuration, downloaded files and saved state are preserved.');
