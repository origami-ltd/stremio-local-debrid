import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { prepareConfig } from '../setup.mjs';
import { installStartup, runtimeDirectory } from '../startup.mjs';

test('setup generates private URLs and preserves existing identity, configuration and runtime state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-setup-'));
  const state = join(directory, 'runtime-state');
  try {
    await writeFile(join(directory, 'config.json'), JSON.stringify({ baseUrl: 'http://127.0.0.1:7810', cacheDir: join(directory, 'media'), language: 'pt_PT', autoDiscoverAddons: false, sources: [{ name: 'Provider', manifestUrl: 'https://addon.example/configuration/manifest.json' }] }));
    const initial = await prepareConfig(directory, state);
    assert.match(initial.token, /^[a-f0-9]{48}$/);
    assert.equal(initial.language, 'pt-PT');
    assert.equal((await readFile(join(state, 'addon-url.txt'), 'utf8')).trim(), `${initial.baseUrl}/${initial.token}/manifest.json`);
    await writeFile(join(state, 'downloads.json'), '[{"synthetic":"retained"}]');
    const again = await prepareConfig(directory, state);
    assert.equal(again.token, initial.token);
    assert.deepEqual(again.sources, initial.sources);
    assert.equal(await readFile(join(state, 'downloads.json'), 'utf8'), '[{"synthetic":"retained"}]');
    if (process.platform !== 'win32') assert.equal((await stat(join(state, 'addon-url.txt'))).mode & 0o777, 0o600);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('platform startup files safely handle spaces, quotes and systemd specifiers; native parsers accept them', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-startup-'));
  const runtime = join(directory, "Runtime's cache & 100% ready");
  await mkdir(runtime);
  try {
    assert.equal(runtimeDirectory('linux', directory, {}), join(directory, '.local', 'share', 'stremio-local-debrid'));
    assert.equal(runtimeDirectory('win32', directory, { LOCALAPPDATA: directory }), join(directory, 'StremioLocalDebrid'));
    const calls = [];
    const options = { home: directory, environment: {}, node: process.execPath, uid: 123, execute: (file, args) => { calls.push({ file, args }); if (args[0] === 'print') throw new Error('not registered'); } };
    const mac = await installStartup(runtime, { ...options, platform: 'darwin' });
    const plist = await readFile(mac, 'utf8');
    assert.ok(plist.includes('&amp;'));
    assert.ok(plist.includes('&apos;'));
    assert.deepEqual(calls.at(-1), { file: 'launchctl', args: ['kickstart', '-k', 'gui/123/local.stremio.cache'] });
    const linux = await installStartup(runtime, { ...options, platform: 'linux' });
    const unit = await readFile(linux, 'utf8');
    assert.ok(unit.includes('100%% ready'));
    assert.ok(unit.includes('WantedBy=default.target'));
    assert.deepEqual(calls.at(-1), { file: 'systemctl', args: ['--user', 'restart', 'stremio-local-debrid.service'] });
    const windows = await installStartup(runtime, { ...options, platform: 'win32' });
    const ps = await readFile(windows, 'utf8');
    assert.ok(ps.includes("Runtime''s cache"));
    assert.ok(ps.includes('-LogonType Interactive -RunLevel Limited'));
    assert.ok(ps.includes('-AtLogOn -User $identity.Name'));
    assert.deepEqual(calls.at(-1).args, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', windows]);
    if (process.platform === 'darwin') execFileSync('plutil', ['-lint', mac]);
    if (process.platform === 'linux') execFileSync('systemd-analyze', ['verify', linux], { env: { ...process.env, SYSTEMD_LOG_LEVEL: 'err' } });
    if (process.platform === 'win32') {
      const validator = join(directory, 'validate.ps1');
      await writeFile(validator, "$tokens = $null; $errors = $null\n[System.Management.Automation.Language.Parser]::ParseFile($args[0], [ref]$tokens, [ref]$errors) | Out-Null\nif ($errors.Count) { $errors | Write-Error; exit 1 }\n");
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', validator, windows]);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
