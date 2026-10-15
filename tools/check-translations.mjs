// Checks the English translation (see src/game/lang.ts) against the rules
// it was written under:
//
// 1. The Tagalog is untouched: every string in src/ at the base commit (main
//    by default) is still there, byte for byte. Adding is fine; changing or
//    removing one fails the check.
// 2. Words that stay as they are in English (Kuya, Ate, food, baon) are still
//    in the English, and no Tagalog particles (po, naman, 'no...) are left in it.
// 3. Which lines have no English yet. Lines listed in
//    docs/translation-review.md (flagged, or already English) are left out.
// 4. tr() falls back to the Tagalog for a missing or blank translation.
//
//   node tools/check-translations.mjs              # all four, list the missing lines
//   node tools/check-translations.mjs --base HEAD~3
//   node tools/check-translations.mjs --strict     # also fail while any line has no English
//
// Uses the TypeScript compiler the project already has; nothing to install.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'main';
const strict = args.includes('--strict');

/** names that stay the same in English, written as they are in the Tagalog */
const KEEP_NAMES = ['Kuya', 'Ate', 'Manong', 'Mang', 'Aling'];
/** Filipino food names, and baon: never translated. Plain words around them (egg, soup, coffee, onions) are. */
const KEEP_FOOD = [
  'baon', 'adobo', 'taho', 'sago', 'arnibal', 'kwek-kwek', 'siomai', 'palamig', "sago't gulaman", 'gulaman', 'kanin', 'suka',
  'toyo', 'kalamansi', 'ulam', 'kakanin', 'sitsirya', 'tapa', 'sinangag', 'turon', 'pandesal', 'apa', 'lugaw', 'banana cue',
  'fishball', 'kikiam', 'sisig',
];
/** Tagalog particles that should never be left in an English line */
const PARTICLES = ['po', 'opo', 'naman', 'sige', 'pala', 'talaga', 'tara', "'no", 'ha', 'kasi', 'lang', 'na'];

let failed = false;
const fail = (msg) => {
  failed = true;
  console.log(`FAIL  ${msg}`);
};

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

function parse(name, source) {
  return ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true);
}

/** a string or template's text as written between its quotes */
function literal(node) {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) return node.getText().slice(1, -1);
  return null;
}

/** Every string and template in a file, apart from import paths, keyed to count. */
function strings(sf) {
  const out = new Map();
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    const s = literal(node);
    if (s !== null) {
      out.set(s, (out.get(s) ?? 0) + 1);
      // a template's own text includes the strings inside it; don't count those twice
      if (ts.isTemplateExpression(node)) return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

const prop = (obj, name) =>
  obj.properties.find((p) => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name.getText() === name);

/** every string a property's value can come out as: `a ? 'x' : 'y'` gives both */
function outcomes(node) {
  if (!node) return [];
  if (ts.isParenthesizedExpression(node)) return outcomes(node.expression);
  if (ts.isConditionalExpression(node)) return [...outcomes(node.whenTrue), ...outcomes(node.whenFalse)];
  const s = literal(node);
  return s === null ? [] : [s];
}

// --- 1. the Tagalog is untouched ---------------------------------------------

const srcFiles = files(join(ROOT, 'src'));
let compared = 0;
for (const file of srcFiles) {
  const rel = relative(ROOT, file);
  let old;
  try {
    old = execFileSync('git', ['show', `${base}:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    continue; // a new file: nothing in it to keep
  }
  const before = strings(parse(rel, old));
  const after = strings(parse(rel, readFileSync(file, 'utf8')));
  for (const [s, n] of before) {
    compared += n;
    const left = after.get(s) ?? 0;
    if (left < n) fail(`${rel}: changed or removed since ${base}: ${JSON.stringify(s)}`);
  }
}
console.log(`ok    ${compared} strings from ${base} checked in src/`);

// --- 2 and 3. the English itself -------------------------------------------

const review = (() => {
  try {
    const md = readFileSync(join(ROOT, 'docs/translation-review.md'), 'utf8');
    return new Set([...md.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]));
  } catch {
    return new Set();
  }
})();

const word = (w, flags) => new RegExp(`(^|[^\\p{L}'])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, flags);
const missing = [];
let translated = 0;

for (const file of srcFiles) {
  const rel = relative(ROOT, file);
  const sf = parse(rel, readFileSync(file, 'utf8'));
  const at = (n) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;

  /** a Tagalog string and its English (or none), checked against the word rules */
  const pair = (node, tl, enNode) => {
    const tls = outcomes(tl);
    if (!tls.length) return; // built some other way, e.g. a variable
    const ens = outcomes(enNode);
    if (!enNode) {
      for (const s of tls) if (!review.has(s)) missing.push(`${at(node)}  ${s}`);
      return;
    }
    translated++;
    const tlAll = tls.join('\n');
    const enAll = ens.join('\n');
    for (const w of KEEP_NAMES) if (word(w, 'u').test(tlAll) && !word(w, 'u').test(enAll)) fail(`${at(node)}: "${w}" should stay in the English`);
    for (const w of KEEP_FOOD) if (word(w, 'iu').test(tlAll) && !word(w, 'iu').test(enAll)) fail(`${at(node)}: "${w}" should stay in the English`);
    for (const w of PARTICLES) if (word(w, 'iu').test(enAll)) fail(`${at(node)}: Tagalog "${w}" left in the English: ${enAll}`);
  };

  /** deadEnd()'s last argument holds the English itself, not a hotspot or a line */
  const englishOf = (node) => {
    const call = node.parent;
    return ts.isCallExpression(call) && call.expression.getText() === 'deadEnd' && call.arguments[4] === node;
  };

  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node) && !englishOf(node)) {
      const text = prop(node, 'text');
      if (text && ts.isPropertyAssignment(text)) pair(node, text.initializer, prop(node, 'en')?.initializer);
      const label = prop(node, 'label');
      if (label && ts.isPropertyAssignment(label)) pair(node, label.initializer, prop(node, 'labelEn')?.initializer);
      const subtitle = prop(node, 'subtitle');
      if (subtitle && ts.isPropertyAssignment(subtitle)) pair(node, subtitle.initializer, prop(node, 'subtitleEn')?.initializer);
    }
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText();
      const a = node.arguments;
      if (name === 'tr') pair(node, a[0], a[1]);
      if (name === 'wayTo') pair(node, a[2], a[6]);
      if (name === 'deadEnd') {
        const en = a[4] && ts.isObjectLiteralExpression(a[4]) ? a[4] : null;
        pair(node, a[2], en && prop(en, 'label')?.initializer);
        pair(node, a[3], en && prop(en, 'text')?.initializer);
      }
    }
    ts.forEachChild(node, visit);
  };
  // helpers and the dialogue box itself pass text along; only the places that write it count
  if (/src\/game\/(story|scenes|ui)\/|src\/game\/area\.ts$/.test(rel)) visit(sf);
}

console.log(`ok    ${translated} lines and labels have English`);
if (missing.length) {
  console.log(`${strict ? 'FAIL' : 'todo'}  ${missing.length} still have none (Tagalog shows instead):`);
  for (const m of missing) console.log(`        ${m}`);
  if (strict) failed = true;
}

// --- 4. the fallback --------------------------------------------------------

const js = ts.transpileModule(readFileSync(join(ROOT, 'src/game/lang.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const lang = await import(`data:text/javascript,${encodeURIComponent(js)}`);
const cases = [
  ['tl', 'x', 'y', 'x'],
  ['en', 'x', 'y', 'y'],
  ['en', 'x', undefined, 'x'],
  ['en', 'x', '', 'x'],
  ['en', 'x', '   ', 'x'],
];
for (const [l, tl, en, want] of cases) {
  lang.setLang(l, false);
  const got = lang.tr(tl, en);
  if (got !== want) fail(`tr(${JSON.stringify(tl)}, ${JSON.stringify(en)}) in ${l} gave ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
}
console.log(`ok    tr() falls back to the Tagalog (${cases.length} cases)`);

process.exit(failed ? 1 : 0);
