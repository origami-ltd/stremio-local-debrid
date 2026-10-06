import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, prepareConfig } from './setup.mjs';
import { locales, languageCode } from './i18n.mjs';
import { installService } from './install.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const gib = 2 ** 30;
const isLanguage = value => Object.keys(locales).some(code => code.toLowerCase() === value.replaceAll('_', '-').toLowerCase());
const isAddress = value => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash; } catch { return false; } };
const isAddon = value => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && /\/manifest\.json$|\/stremio\/v1(?:\/stremioget)?\/?$/.test(url.pathname); } catch { return false; } };

export async function runSetup(options = {}) {
  const directory = options.directory || root;
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const { values } = parseArgs({ args: options.args || process.argv.slice(2), options: { yes: { type: 'boolean', short: 'y' }, 'no-service': { type: 'boolean' }, lang: { type: 'string' }, help: { type: 'boolean', short: 'h' } } });
  if (values.lang && !isLanguage(values.lang)) throw new Error(`Unknown locale: ${values.lang}. Use a code from locales/stremio-languages.json.`);
  let config = await loadConfig(directory);
  config.language = values.lang ? languageCode(values.lang) : config.language;
  let t = locales[config.language].cli;
  const print = value => output.write(`${value}\n`);
  if (values.help) {
    print(`npm run setup -- [--yes] [--no-service] [--lang ${config.language}]\n${t.help}`);
    return;
  }
  if (!values.yes && (!input.isTTY || !output.isTTY) && !options.question) throw new Error(t.nonInteractive);
  let readline;
  const abort = new AbortController();
  if (!values.yes && !options.question) {
    readline = createInterface({ input, output });
    readline.on('SIGINT', () => abort.abort());
    readline.on('close', () => abort.abort());
  }
  const question = options.question || ((prompt) => readline.question(prompt, { signal: abort.signal }));
  const ask = async (label, saved, validate = () => true) => {
    for (;;) {
      const answer = (await question(`${label}${saved === undefined ? '' : ` [${saved}]`}: `)).trim() || String(saved ?? '');
      if (validate(answer)) return answer;
      print(t.invalid);
    }
  };
  const yesNo = async (label, saved) => {
    const answer = await ask(`${label} (1=${t.yes}, 2=${t.no})`, saved ? '1' : '2', value => ['1', '2'].includes(value));
    return answer === '1';
  };
  let startup = !values['no-service'];
  try {
    print(`\nStremio Local Debrid\n${t.intro}`);
    if (!values.yes) {
      for (;;) {
        const language = await ask(`${locales[config.language].language} (? = 51)`, config.language, value => value === '?' || isLanguage(value));
        if (language !== '?') { config.language = languageCode(language); t = locales[config.language].cli; break; }
        print(Object.entries(locales).map(([code, locale]) => `${code}: ${locale.localeName}`).join('\n'));
      }
      const previousPort = config.port;
      config.port = Number(await ask(t.port, config.port, value => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 65535));
      if (config.baseUrl) {
        const address = new URL(config.baseUrl);
        if (Number(address.port || (address.protocol === 'https:' ? 443 : 80)) === previousPort) address.port = String(config.port);
        config.baseUrl = address.href.replace(/\/$/, '');
      }
      config.baseUrl = await ask(t.address, config.baseUrl || undefined, isAddress);
      config.cacheDir = await ask(t.cache, config.cacheDir, value => !!value);
      config.maxCacheBytes = Math.round(Number(await ask(t.budget, config.maxCacheBytes / gib, value => Number(value) > 0 && Number.isSafeInteger(Math.round(Number(value) * gib)))) * gib);
      config.minFreeBytes = Math.round(Number(await ask(t.reserve, config.minFreeBytes / gib, value => Number(value) >= 0 && Number.isSafeInteger(Math.round(Number(value) * gib)))) * gib);
      config.autoDiscoverAddons = process.platform === 'darwin' && await yesNo(t.discover, config.autoDiscoverAddons);
      if (!config.autoDiscoverAddons) {
        if (config.sources.length && !await yesNo(`${t.keepAddons} (${config.sources.length})`, true)) config.sources = [];
        print(t.addons);
        for (;;) {
          const manifestUrl = await ask(t.addon, undefined, value => !value || isAddon(value));
          if (!manifestUrl) break;
          if (!config.sources.some(source => source.manifestUrl === manifestUrl)) config.sources.push({ name: new URL(manifestUrl).hostname, manifestUrl });
        }
      }
      if (!values['no-service']) startup = await yesNo(t.startup, true);
    }
    if (!isAddress(config.baseUrl)) throw new Error(t.invalid);
    config = await prepareConfig(directory, undefined, config);
    print(`${t.saved}: ${join(directory, 'config.json')}`);
    if (startup) {
      const result = await (options.install || installService)(directory);
      config = result.config;
      print(`${t.ready}: ${config.baseUrl}\n${t.startup}: ${result.startupFile}`);
    } else {
      print('npm start');
    }
    print(`${locales[config.language].addonUrl}: ${join(config.stateDir, 'addon-url.txt')}\n${locales[config.language].status}: ${join(config.stateDir, 'status-url.txt')}\n${t.connect}`);
    return config;
  } catch (error) {
    if (abort.signal.aborted || error.name === 'AbortError') { print(t.cancelled); return; }
    throw error;
  } finally { readline?.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await runSetup(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
