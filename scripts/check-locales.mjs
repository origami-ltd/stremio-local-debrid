import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { locales } from '../i18n.mjs';

const registry = JSON.parse(await readFile(new URL('../locales/stremio-languages.json', import.meta.url), 'utf8'));
const leaves = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) => typeof item === 'object' ? leaves(item, `${prefix}${key}.`) : [`${prefix}${key}`]);
const expected = leaves(locales['en-US']).sort();
assert.deepEqual(Object.keys(locales).sort(), registry.locales.sort(), 'Locale coverage must match the pinned Stremio registry.');
for (const [code, dictionary] of Object.entries(locales)) {
  assert.deepEqual(leaves(dictionary).sort(), expected, `Missing or unknown translation keys: ${code}`);
  for (const path of expected) {
    const value = path.split('.').reduce((current, key) => current[key], dictionary);
    assert.ok(typeof value === 'string' && value.trim(), `Empty translation: ${code}/${path}`);
  }
}
console.log(`Complete dictionaries: ${Object.keys(locales).length} locales, ${expected.length} strings each.`);
