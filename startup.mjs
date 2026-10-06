import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const xml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const systemdQuote = value => `"${String(value).replaceAll('%', '%%').replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
const powershellQuote = value => `'${String(value).replaceAll("'", "''")}'`;

export function runtimeDirectory(platform = process.platform, home = homedir(), environment = process.env) {
  if (platform === 'darwin') return join(home, 'Library', 'Application Support', 'stremio-local-debrid');
  if (platform === 'win32') return join(environment.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'StremioLocalDebrid');
  if (platform === 'linux') return join(environment.XDG_DATA_HOME || join(home, '.local', 'share'), 'stremio-local-debrid');
  throw new Error(`Automatic startup is unsupported on ${platform}.`);
}

export async function installStartup(runtime, options = {}) {
  const platform = options.platform || process.platform;
  const home = options.home || homedir();
  const environment = options.environment || process.env;
  const execute = options.execute || ((file, args) => execFileSync(file, args, { stdio: 'pipe', windowsHide: true }));
  const node = options.node || process.execPath;
  const server = join(runtime, 'server.mjs');
  if (platform === 'darwin') {
    const directory = join(home, 'Library', 'LaunchAgents');
    await mkdir(directory, { recursive: true });
    const plist = join(directory, 'local.stremio.cache.plist');
    await writeFile(plist, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>local.stremio.cache</string>
<key>ProgramArguments</key><array><string>${xml(node)}</string><string>${xml(server)}</string></array>
<key>WorkingDirectory</key><string>${xml(runtime)}</string>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>10</integer>
<key>StandardOutPath</key><string>${xml(join(runtime, 'state', 'service.log'))}</string>
<key>StandardErrorPath</key><string>${xml(join(runtime, 'state', 'service-error.log'))}</string>
</dict></plist>\n`);
    const domain = `gui/${options.uid ?? process.getuid()}`;
    let registered = false;
    try { execute('launchctl', ['print', `${domain}/local.stremio.cache`]); registered = true; } catch {}
    if (!registered) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try { execute('launchctl', ['bootstrap', domain, plist]); break; }
        catch (error) { if (attempt === 3) throw error; await delay(1000); }
      }
    }
    execute('launchctl', ['kickstart', '-k', `${domain}/local.stremio.cache`]);
    return plist;
  }
  if (platform === 'linux') {
    const directory = join(environment.XDG_CONFIG_HOME || join(home, '.config'), 'systemd', 'user');
    await mkdir(directory, { recursive: true });
    const unit = join(directory, 'stremio-local-debrid.service');
    await writeFile(unit, `[Unit]
Description=Stremio Local Debrid
After=network-online.target

[Service]
Type=simple
WorkingDirectory=${systemdQuote(runtime)}
ExecStart=${systemdQuote(node)} ${systemdQuote(server)}
Restart=always
RestartSec=10
UMask=0077
TimeoutStopSec=30

[Install]
WantedBy=default.target
`);
    execute('systemctl', ['--user', 'daemon-reload']);
    execute('systemctl', ['--user', 'enable', 'stremio-local-debrid.service']);
    execute('systemctl', ['--user', 'restart', 'stremio-local-debrid.service']);
    return unit;
  }
  if (platform === 'win32') {
    const script = join(runtime, 'install-startup.ps1');
    const argument = `"${server}"`;
    await writeFile(script, `$ErrorActionPreference = 'Stop'
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$action = New-ScheduledTaskAction -Execute ${powershellQuote(node)} -Argument ${powershellQuote(argument)} -WorkingDirectory ${powershellQuote(runtime)}
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $identity.Name
$principal = New-ScheduledTaskPrincipal -UserId $identity.Name -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Get-ScheduledTask -TaskName 'Stremio Local Debrid' -ErrorAction SilentlyContinue | Stop-ScheduledTask -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName 'Stremio Local Debrid' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName 'Stremio Local Debrid'
`);
    execute('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script]);
    return script;
  }
  throw new Error(`Automatic startup is unsupported on ${platform}.`);
}
