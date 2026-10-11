// Walks every hotspot in every area and reports what pressing E on it does.
// It catches the mistakes that are easy to make when scenes are joined up:
// a way out that names a spawn point the other scene doesn't have, a hotspot
// placed where the player can't stand, a door that does nothing.
//
// Run it with the dev server up:
//
//   npm run dev            (in one terminal)
//   npm run check:links    (in another)
//
// It needs Chrome. Set CHROME to its path if it isn't in the usual place, and
// GAME_URL if the dev server isn't on http://localhost:5173.
//
// It drives a real, headless Chrome: the player is put next to each hotspot
// and a real E key press is sent. It reads the result through `window.hau`,
// which src/main.ts only sets in the dev server.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.env.GAME_URL ?? 'http://localhost:5173';
const PORT = 9333;
const CHROME =
  process.env.CHROME ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => existsSync(p));

if (!CHROME) {
  console.error('Chrome not found. Set the CHROME environment variable to its path.');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'hau-check-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--window-size=960,540', 'about:blank',
]);

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = pages.find((p) => p.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch {
      // Chrome is still starting
    }
    await sleep(200);
  }
  throw new Error('could not reach Chrome');
}

const ws = await connect();
await new Promise((r) => ws.addEventListener('open', r));
let nextId = 0;
const waiting = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && waiting.has(msg.id)) {
    waiting.get(msg.id)(msg);
    waiting.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    waiting.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
async function run(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'page error');
  return r.result?.result?.value;
}
async function key(code, keyName, ms = 60) {
  const base = { code, key: keyName, windowsVirtualKeyCode: keyName.toUpperCase().charCodeAt(0) };
  await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base });
  await sleep(ms);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
}

let failures = 0;
const fail = (text) => {
  failures++;
  console.log(`  FAIL  ${text}`);
};

try {
  // flags that get you past the main gate, so its turnstile doesn't hold the test up
  await send('Page.navigate', { url: `${URL}/?area=plaza&flags=passed_bag_check,scanned_id,id_fumble` });
  for (let i = 0; i < 50 && !(await run('!!window.hau')); i++) await sleep(200);
  if (!(await run('!!window.hau'))) throw new Error(`the game did not load from ${URL}. Is "npm run dev" running?`);

  // note every travel() the game is asked for, and whether the spawn it names exists
  await run(`
    const go = hau.travel.bind(hau);
    hau.travel = (area, spawn) => {
      const there = hau.areas.get(area);
      window.__went = { area, spawn, areaOk: !!there, spawnOk: !!there?.def.spawns[spawn] };
      go(area, spawn);
    };
  `);

  const areas = await run(`[...hau.areas.values()].map((a) => ({
    id: a.def.id, width: a.def.width, bounds: a.def.bounds,
    spawns: Object.entries(a.def.spawns).map(([name, s]) => ({ name, x: s.x })),
    hotspots: a.def.hotspots.map((h) => ({ id: h.id, x: h.x, range: h.range, label: h.label })),
  }))`);

  const links = [];
  for (const area of areas) {
    console.log(`\n${area.id}  (${area.width}px, ${area.hotspots.length} hotspots)`);
    for (const s of area.spawns) {
      if (s.x < area.bounds[0] || s.x > area.bounds[1]) fail(`spawn "${s.name}" at x=${s.x} is outside the walkable part ${area.bounds}`);
    }
    for (const h of area.hotspots) {
      const stand = Math.max(area.bounds[0], Math.min(area.bounds[1], h.x));
      if (Math.abs(stand - h.x) >= h.range) {
        fail(`${h.id}: at x=${h.x} it can't be reached from the walkable part ${area.bounds}`);
        continue;
      }
      await run(`
        window.__went = null;
        hau.pending = null; hau.cutscene = null; hau.fade = 0;
        hau.dialogue.line = null; hau.dialogue.queue = [];
        hau.phone.open = false; hau.map.open = false;
        hau.area = hau.areas.get(${JSON.stringify(area.id)});
        hau.area.enter('');
        hau.area.player.x = ${stand};
        hau.area.camera.snap(${stand});
      `);
      await sleep(120);
      const seen = await run('hau.target ? hau.target.label : null');
      await key('KeyE', 'e');
      await sleep(180);
      const after = await run(`({ went: window.__went, talking: hau.dialogue.active, cutscene: !!hau.cutscene })`);
      let what;
      if (seen !== h.label) {
        what = `not the nearest thing here ("${seen}" is)`;
        console.log(`  note  ${h.id.padEnd(10)} ${what}`);
        continue;
      }
      if (after.went) {
        what = `-> ${after.went.area}/${after.went.spawn}`;
        links.push({ from: area.id, to: after.went.area });
        if (!after.went.areaOk) fail(`${h.id}: goes to "${after.went.area}", which is not an area`);
        else if (!after.went.spawnOk) fail(`${h.id}: goes to ${after.went.area} but it has no spawn called "${after.went.spawn}"`);
      } else if (after.cutscene) what = 'cutscene';
      else if (after.talking) what = 'says something';
      else {
        what = 'nothing happened';
        fail(`${h.id}: pressing E did nothing`);
      }
      console.log(`  ok    ${h.id.padEnd(10)} ${what.padEnd(22)} "${h.label}"`);
    }
  }

  // every street you can walk into should have a way back
  console.log('\nways back');
  for (const l of links) {
    if (l.from !== l.to && !links.some((m) => m.from === l.to && m.to === l.from)) fail(`${l.from} leads to ${l.to}, but nothing in ${l.to} leads back`);
  }

  // and one real walk: hold D and Shift, check the player moved and the map opens
  await run(`
    hau.pending = null; hau.cutscene = null; hau.dialogue.line = null; hau.dialogue.queue = [];
    hau.area = hau.areas.get('walkway'); hau.area.enter('rotunda');
  `);
  const x0 = await run('hau.area.player.x');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ShiftLeft', key: 'Shift', windowsVirtualKeyCode: 16 });
  await key('KeyD', 'd', 1500);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ShiftLeft', key: 'Shift', windowsVirtualKeyCode: 16 });
  const x1 = await run('hau.area.player.x');
  console.log(`\nwalk  ran right for 1.5 s: x ${Math.round(x0)} -> ${Math.round(x1)}`);
  if (x1 - x0 < 60) fail('holding D and Shift did not move the player');
  await key('KeyC', 'c');
  await sleep(100);
  if (!(await run('hau.map.open'))) fail('C did not open the campus map');
  else console.log('map   C opens the campus map');

  console.log(failures ? `\n${failures} problem(s).` : '\nAll links check out.');
} catch (err) {
  console.error(`\n${err.message}`);
  failures++;
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // Chrome can hold on to its profile for a moment; the temp folder is harmless
  }
}
process.exit(failures ? 1 : 0);
