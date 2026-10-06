import { locales, translation, languageCode, direction } from './i18n.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const repository = 'https://github.com/origami-ltd/stremio-local-debrid';
const header = (config, language, title) => {
  const t = translation(language);
  const base = `${config.baseUrl}/${config.token}`;
  return `<!doctype html><html lang="${languageCode(language)}" dir="${direction(language)}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><link rel="icon" href="${base}/assets/logo.png"><link rel="stylesheet" href="${base}/assets/style.css"><header><h1>${escapeHtml(title)}</h1><form><label for="lang">${t.language}</label><select id="lang" name="lang">${Object.entries(locales).map(([code, data]) => `<option value="${code}"${code === languageCode(language) ? ' selected' : ''}>${escapeHtml(data.localeName)}</option>`).join('')}</select><button aria-label="${t.language}">→</button></form></header>`;
};
const footer = language => `<footer><a href="${repository}">Origami · Stremio Local Debrid</a> · <a href="${repository}/blob/main/LICENSE.md">MIT-PoU</a> · <a href="${repository}/issues">GitHub</a></footer></html>`;

export function renderDashboard(config, language, downloads, sources, bytes) {
  const t = translation(language);
  const base = `${config.baseUrl}/${config.token}/${languageCode(language)}`;
  const addonURL = `${base}/manifest.json`;
  return `${header(config, language, t.name)}<p>${escapeHtml(t.description)}</p><p><a class="button" href="${escapeHtml(addonURL.replace(/^https?:/, 'stremio:'))}">${t.install}</a> · <a href="${base}/guide">${t.documentation}</a></p><label for="addon">${t.addonUrl}</label><input id="addon" readonly value="${escapeHtml(addonURL)}"><p class="muted">${(bytes / 2 ** 30).toFixed(1)} / ${(config.maxCacheBytes / 2 ** 30).toFixed(0)} GiB</p><table><tr><th>${t.file}</th><th>${t.status}</th><th>${t.progress}</th></tr>${downloads.map(download => `<tr><td>${escapeHtml(download.filename)}</td><td>${escapeHtml(download.status === 'complete' ? t.cached : download.status === 'error' ? t.errors[download.error] || download.error : t.downloading)}</td><td>${(download.progress * 100).toFixed(1)}%</td></tr>`).join('')}</table>${downloads.length ? '' : `<p class="muted">${t.empty}</p>`}<h2>${t.sources}</h2><ul>${sources.sources.map(source => `<li>${escapeHtml(source.name)}</li>`).join('')}</ul>${footer(language)}`;
}

export function renderGuide(config, language) {
  const t = translation(language);
  return `${header(config, language, t.documentation)}<p><a href="${config.baseUrl}/${config.token}/${languageCode(language)}/">${t.name}</a></p>${Object.entries(t.guide).map(([key, section]) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p>${key === 'setup' ? '<pre><code>git clone https://github.com/origami-ltd/stremio-local-debrid.git\ncd stremio-local-debrid\nnpm ci\nnpm run setup</code></pre><pre><code>npm run setup -- --no-service\nnpm start</code></pre>' : ''}</section>`).join('')}${footer(language)}`;
}
