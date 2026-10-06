import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { installStartup } from '../startup.mjs';

assert.equal(process.platform, 'win32');
assert.equal(process.env.GITHUB_ACTIONS, 'true', 'This native registration check is restricted to disposable CI runners.');
const runtime = await mkdtemp(join(tmpdir(), 'stremio-task-'));
const execute = script => execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8' });
try {
  await writeFile(join(runtime, 'server.mjs'), "import {writeFileSync} from 'node:fs';\nwriteFileSync(new URL('./started.txt', import.meta.url), String(process.pid));\nsetInterval(() => {}, 1000);\n");
  await installStartup(runtime);
  const task = JSON.parse(execute("$t = Get-ScheduledTask -TaskName 'Stremio Local Debrid'; [pscustomobject]@{execute=$t.Actions[0].Execute; workingDirectory=$t.Actions[0].WorkingDirectory; logonType=[string]$t.Principal.LogonType; runLevel=[string]$t.Principal.RunLevel; trigger=[string]$t.Triggers[0].CimClass.CimClassName; enabled=$t.Settings.Enabled} | ConvertTo-Json -Compress"));
  assert.equal(task.execute.toLowerCase(), process.execPath.toLowerCase());
  assert.equal(task.workingDirectory, runtime);
  assert.equal(task.logonType, 'Interactive');
  assert.equal(task.runLevel, 'Limited');
  assert.equal(task.trigger, 'MSFT_TaskLogonTrigger');
  assert.equal(task.enabled, true);
  let started = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { started = Number(await readFile(join(runtime, 'started.txt'), 'utf8')) > 0; } catch {}
    if (started) break;
    await delay(250);
  }
  assert.ok(started, 'Task Scheduler must actually start the Node.js process.');
  console.log('Native Windows Task Scheduler registered the login task and started the Node.js process.');
} finally {
  execute("$t = Get-ScheduledTask -TaskName 'Stremio Local Debrid' -ErrorAction SilentlyContinue; if ($t) { $t | Stop-ScheduledTask; $t | Unregister-ScheduledTask -Confirm:$false }");
  await rm(runtime, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
}
