import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import fs from 'node:fs';

// Registers the Tokens Studio transforms + the `tokens-studio` preprocessor.
// This is what resolves the math expressions (e.g. {dimension.xs} * {dimension.scale},
// roundTo({fontSizes.body}*1.25^5)) and expands composite typography / shadow tokens.
// A plain Style Dictionary build cannot do this — sd-transforms is required.
register(StyleDictionary);

// --- Flatten the Tokens Studio single-file export -------------------------------
// tokens.json keeps each set under a top-level key (core / light / dark / theme),
// but Tokens Studio references drop the set name — e.g. {colors.black},
// {accent.default}, {borderRadius.lg}. Those only resolve when the chosen sets are
// merged at the root. For single mode we take core + light + theme (skip dark).
// To flip to dark mode later, swap 'light' for 'dark' below.
const all = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
const SETS = ['core', 'light', 'theme'];

const isToken = (v) => v && typeof v === 'object' && '$value' in v;
const deepMerge = (target, src) => {
  for (const key of Object.keys(src)) {
    if (key.startsWith('$')) continue; // skip set-level $type/$description
    if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key]) && !isToken(src[key])) {
      target[key] = deepMerge(target[key] ?? {}, src[key]);
    } else {
      target[key] = src[key];
    }
  }
  return target;
};

const merged = {};
for (const set of SETS) {
  if (all[set]) deepMerge(merged, all[set]);
}
fs.writeFileSync('tokens.flat.json', JSON.stringify(merged, null, 2));

// --- Build CSS custom properties ------------------------------------------------
const sd = new StyleDictionary({
  source: ['tokens.flat.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'], // if names come out untransformed, this is the line to check
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: false }, // keep false for validation; flip to true once customizing
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
console.log('✓ Built build/css/tokens.css');
