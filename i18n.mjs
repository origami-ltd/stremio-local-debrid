import { readdir, readFile } from 'node:fs/promises';

export const locales = Object.fromEntries(await Promise.all((await readdir(new URL('./locales/', import.meta.url))).filter(file => file.endsWith('.json') && file !== 'stremio-languages.json').map(async file => [file.slice(0, -5), JSON.parse(await readFile(new URL(`./locales/${file}`, import.meta.url), 'utf8'))])));
const aliases = { ar: 'ar-AR', be: 'be-BY', bg: 'bg-BG', bn: 'bn-BD', ca: 'ca-ES', cs: 'cs-CZ', da: 'da-DK', de: 'de-DE', el: 'el-GR', en: 'en-US', eo: 'eo-EO', es: 'es-ES', et: 'et-EE', eu: 'eu-ES', fa: 'fa-IR', fi: 'fi-FI', fr: 'fr-FR', he: 'he-IL', hi: 'hi-IN', hr: 'hr-HR', hu: 'hu-HU', id: 'id-ID', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', lt: 'lt-LT', mk: 'mk-MK', my: 'my-BM', nb: 'nb-NO', ne: 'ne-NP', nl: 'nl-NL', nn: 'nn-NO', pa: 'pa-IN', pl: 'pl-PL', pt: 'pt-BR', ro: 'ro-RO', ru: 'ru-RU', sk: 'sk-SK', sl: 'sl-SL', sr: 'sr-RS', sv: 'sv-SE', ta: 'ta-IN', te: 'te-IN', tr: 'tr-TR', uk: 'uk-UA', ur: 'ur-PK', vi: 'vi-VN', zh: 'zh-CN' };

export function languageCode(value = 'en-US') {
  for (const candidate of String(value).split(',')) {
    const code = candidate.split(';')[0].trim().replaceAll('_', '-');
    const exact = Object.keys(locales).find(locale => locale.toLowerCase() === code.toLowerCase());
    const match = exact || aliases[code.toLowerCase().split('-')[0]];
    if (locales[match]) return match;
  }
  return 'en-US';
}

export const translation = value => locales[languageCode(value)];
export const direction = value => /^(ar|fa|he|ur)-/.test(languageCode(value)) ? 'rtl' : 'ltr';
