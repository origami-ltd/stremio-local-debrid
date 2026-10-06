import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { locales } from '../i18n.mjs';

await mkdir('docs/guides', { recursive: true });
await mkdir('public/locales', { recursive: true });
await mkdir('public/configure', { recursive: true });
const index = [];
for (const [code, t] of Object.entries(locales)) {
  let guide = `# Stremio Local Debrid — ${t.localeName}\n\n${t.description}\n\n`;
  for (const [key, section] of Object.entries(t.guide)) {
    guide += `## ${section.title}\n\n${section.body}\n\n`;
    if (key === 'setup') guide += '```sh\ngit clone https://github.com/origami-ltd/stremio-local-debrid.git\ncd stremio-local-debrid\nnpm ci\nnpm run install:service\n```\n\n```sh\nnpm run setup\nnpm start\n```\n\n';
  }
  guide += '[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)\n';
  await writeFile(`docs/guides/${code}.md`, guide);
  await cp(`locales/${code}.json`, `public/locales/${code}.json`);
  index.push({ code, name: t.localeName });
}
await writeFile('public/locales/index.json', JSON.stringify(index, null, 2) + '\n');
await writeFile('docs/LANGUAGES.md', `# Languages\n\nUI, source labels, errors and installation guides cover the ${index.length} locales listed in [Stremio's translation registry](https://github.com/Stremio/stremio-translations/blob/b48c39cf233afea4dea2d562494a9936cf05ae12/index.js), checked on 2026-10-06. This list describes interface translations, not every possible audio or subtitle language.\n\n| Language | Guide | Code |\n| --- | --- | --- |\n${index.map(locale => `| ${locale.name} | [${locale.name}](guides/${locale.code}.md) | \`${locale.code}\` |`).join('\n')}\n\nChoose a language on the local dashboard before installing. Localized manifest paths are \`/<private-token>/<locale>/manifest.json\`; the original path uses \`config.json\`'s \`language\` setting. Translations cover this addon only; upstream addon titles and filenames retain their original text. Right-to-left layout is enabled for Arabic, Persian, Hebrew and Urdu.\n\nEdit \`locales/<code>.json\`, run \`npm run check:locales\` and \`npm run build:docs\`, and include the generated guide and portal data in your pull request. Native-speaker corrections are welcome.\n`);
const portal = await readFile('public/index.html', 'utf8');
await writeFile('public/configure/index.html', portal.replaceAll('./assets/', '../assets/'));
console.log(`Built ${index.length} localized guides and portal dictionaries.`);
