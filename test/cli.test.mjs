import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { runSetup } from '../cli.mjs';

test('wizard validates answers, saves manual URLs without disclosure and preserves identity and downloads', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-wizard-'));
  let printed = '';
  const output = { write: value => { printed += value; } };
  const token = 'private-synthetic-token-for-wizard';
  const manifestUrl = 'https://addon.example/private-configuration/manifest.json?key=synthetic';
  try {
    await writeFile(join(directory, 'config.json'), JSON.stringify({ token, baseUrl: 'http://127.0.0.1:7810', sources: [{ name: 'Saved', manifestUrl: 'https://saved.example/manifest.json' }] }));
    await mkdir(join(directory, 'state'));
    await writeFile(join(directory, 'state', 'downloads.json'), '[{"synthetic":"retained"}]');
    const answers = ['?', 'not-a-locale', 'pt-BR', 'invalid', '70000', '7920', 'ftp://127.0.0.1', 'http://127.0.0.1:7920/', './my cache', '-1', '2.5', '0', ...(process.platform === 'darwin' ? ['2'] : []), '1', 'https://addon.example/video.mp4', manifestUrl, manifestUrl, '', '1'];
    let installations = 0;
    const config = await runSetup({ directory, args: [], output, question: async () => { assert.ok(answers.length); return answers.shift(); }, install: async path => { installations++; return { config: JSON.parse(await readFile(join(path, 'config.json'))), startupFile: join(directory, 'synthetic-service') }; } });
    assert.equal(answers.length, 0);
    assert.equal(installations, 1);
    assert.equal(config.token, token);
    assert.equal(config.baseUrl, 'http://127.0.0.1:7920');
    assert.equal(config.port, 7920);
    assert.equal(config.language, 'pt-BR');
    assert.equal(config.cacheDir, join(directory, 'my cache'));
    assert.equal(config.maxCacheBytes, 2.5 * 2 ** 30);
    assert.equal(config.minFreeBytes, 0);
    assert.equal(config.autoDiscoverAddons, false);
    assert.equal(config.sources.length, 2);
    assert.equal(config.sources[1].manifestUrl, manifestUrl);
    assert.equal(await readFile(join(directory, 'state', 'downloads.json'), 'utf8'), '[{"synthetic":"retained"}]');
    assert.ok(printed.includes('Configuração salva'));
    assert.ok(printed.includes('ja-JP:'));
    assert.ok(!printed.includes(token));
    assert.ok(!printed.includes(manifestUrl));
    assert.equal((await readFile(join(directory, 'state', 'addon-url.txt'), 'utf8')).trim(), `${config.baseUrl}/${token}/manifest.json`);
    if (process.platform !== 'win32') assert.equal((await stat(join(directory, 'config.json'))).mode & 0o777, 0o600);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('cancelling the wizard leaves existing configuration untouched', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-cancel-'));
  const original = '{"baseUrl":"http://127.0.0.1:7810","sources":[]}\n';
  try {
    await writeFile(join(directory, 'config.json'), original);
    let questions = 0;
    const config = await runSetup({ directory, args: [], output: { write() {} }, question: async () => { if (++questions === 3) throw Object.assign(new Error('cancel'), { name: 'AbortError' }); return ''; }, install: () => assert.fail('Cancelled setup must not install startup.') });
    assert.equal(config, undefined);
    assert.equal(await readFile(join(directory, 'config.json'), 'utf8'), original);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('unattended config-only setup works in every locale and the real CLI exposes help', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stremio-unattended-'));
  try {
    await writeFile(join(directory, 'config.json'), '{"baseUrl":"http://127.0.0.1:7810"}');
    const { locales } = await import('../i18n.mjs');
    let token;
    for (const language of Object.keys(locales)) {
      const config = await runSetup({ directory, args: ['--yes', '--no-service', '--lang', language], output: { write() {} }, install: () => assert.fail('Config-only setup must not install startup.') });
      assert.equal(config.language, language);
      token ||= config.token;
      assert.equal(config.token, token);
    }
    const help = execFileSync(process.execPath, ['cli.mjs', '--help', '--lang', 'pt-BR'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.ok(help.includes('Execute npm run setup'));
    assert.ok(help.includes('--no-service'));
    await assert.rejects(runSetup({ directory, args: [], input: {}, output: { write() {} } }), /terminal|--yes/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
