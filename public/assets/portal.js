const root = new URL('../', import.meta.url);
const index = await (await fetch(new URL('locales/index.json', root))).json();
const selector = document.querySelector('#language');
const options = index.map(({ code, name }) => Object.assign(document.createElement('option'), { value: code, textContent: name }));
selector.replaceChildren(...options);
const initial = new URL(location.href).searchParams.get('lang') || navigator.language;
selector.value = index.find(({ code }) => code.toLowerCase() === initial.toLowerCase())?.code || index.find(({ code }) => code.split('-')[0] === initial.split('-')[0])?.code || 'en-US';
let translations;

async function render() {
  const code = selector.value;
  translations = await (await fetch(new URL(`locales/${code}.json`, root))).json();
  document.documentElement.lang = code;
  document.documentElement.dir = /^(ar|fa|he|ur)-/.test(code) ? 'rtl' : 'ltr';
  for (const [id, key] of Object.entries({ description: 'description', 'language-label': 'language', 'install-title': 'install', 'url-prompt': 'urlPrompt', 'address-label': 'addonUrl', prepare: 'install', install: 'install' })) document.getElementById(id).textContent = translations[key];
  document.querySelector('#output').setAttribute('aria-label', translations.addonUrl);
  const sections = Object.entries(translations.guide).map(([key, text]) => {
    const section = document.createElement('section');
    const heading = Object.assign(document.createElement('h2'), { textContent: text.title });
    const body = Object.assign(document.createElement('p'), { textContent: text.body });
    section.append(heading, body);
    if (key === 'setup') {
      for (const command of ['git clone https://github.com/origami-ltd/stremio-local-debrid.git\ncd stremio-local-debrid\nnpm ci\nnpm run install:service', 'npm run setup\nnpm start']) {
        const pre = document.createElement('pre');
        pre.append(Object.assign(document.createElement('code'), { textContent: command }));
        section.append(pre);
      }
    }
    return section;
  });
  document.querySelector('#guide').replaceChildren(...sections);
  document.querySelector('#result').hidden = true;
  document.querySelector('#error').hidden = true;
}

selector.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.set('lang', selector.value);
  history.replaceState(null, '', url);
  void render();
});
document.querySelector('#prepare').addEventListener('click', () => {
  const error = document.querySelector('#error');
  const result = document.querySelector('#result');
  try {
    const url = new URL(document.querySelector('#address').value.trim());
    const parts = url.pathname.split('/').filter(Boolean);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || parts.at(-1) !== 'manifest.json' || !/^[a-zA-Z0-9_-]{24,128}$/.test(parts[0]) || parts.length !== 2 && !(parts.length === 3 && index.some(locale => locale.code === parts[1]))) throw new Error('invalid');
    url.pathname = `/${parts[0]}/${selector.value}/manifest.json`;
    document.querySelector('#output').value = url.href;
    document.querySelector('#install').href = url.href.replace(/^https?:/, 'stremio:');
    error.hidden = true;
    result.hidden = false;
  } catch {
    error.textContent = translations.invalidUrl;
    error.hidden = false;
    result.hidden = true;
  }
});
await render();
