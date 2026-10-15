// Native Chrome smoke checks for the isolated browser 3D trial. --capture saves review PNGs.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.env.GAME_URL ?? 'http://localhost:5173';
const capture = process.argv.includes('--capture');
const production = process.argv.includes('--production');
const output = resolve('builds/aps-browser-review');
if (capture) mkdirSync(output, { recursive: true });
const chromePath = process.env.CHROME ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
if (!chromePath) throw new Error('Chrome not found; set CHROME to its executable.');
const profile = mkdtempSync(join(tmpdir(), 'hau-aps-browser-'));
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0',
  '--enable-webgl', '--ignore-gpu-blocklist', `--user-data-dir=${profile}`, '--window-size=1440,900', 'about:blank'],
{ windowsHide: true, stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; break; } catch {}
    await sleep(150);
  }
  if (!port) throw new Error('Chrome did not start.');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  let id = 0;
  const pending = new Map(), errors = [];
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(arg => arg.description ?? arg.value).join(' '));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') errors.push(msg.params.entry.text);
    if (msg.id) { pending.get(msg.id)?.(msg); pending.delete(msg.id); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const call = ++id;
    const timeout = setTimeout(() => { pending.delete(call); reject(new Error(`Timed out: ${method}`)); }, 30000);
    pending.set(call, result => { clearTimeout(timeout); result.error ? reject(new Error(JSON.stringify(result.error))) : resolve(result); });
    ws.send(JSON.stringify({ id: call, method, params }));
  });
  const run = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.result.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails));
    return response.result.result.value;
  };
  const assert = (condition, description) => { if (!condition) throw new Error(description); console.log(`PASS ${description}`); };
  const key = async (code, key, pressed) => send('Input.dispatchKeyEvent', { type: pressed ? 'keyDown' : 'keyUp', code, key, windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0) });
  const shot = async name => {
    await sleep(150);
    if (capture) {
      const result = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(output, `${name}.png`), Buffer.from(result.result.data, 'base64'));
    }
  };
  await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${root}/aps-3d.html` });
  const ready = production ? '!!document.querySelector("#scene-status")?.hidden' : '!!window.aps3d?.ready';
  for (let i = 0; i < 150 && !(await run(ready)); i++) await sleep(200);
  assert(await run(ready), 'WebGL scene and four sprite sheets load');
  if (production) {
    assert(await run('!window.aps3d'), 'production omits development scene controls');
    assert(await run('document.querySelector("canvas").width === 640 && document.querySelector("canvas").height === 360'), 'built page initializes the pixel renderer');
    assert(await run('[...document.querySelectorAll("button,select")].every(control => !control.disabled)'), 'built page enables controls after assets load');
    await run('document.querySelector("#time").value="21"; document.querySelector("#time").dispatchEvent(new Event("change")); document.querySelector("#character").click(); document.querySelector("#reset").click()');
    await sleep(250);
    assert(await run('document.querySelector("#time").value === "16.5" && document.querySelector("#framing").value === "98"'), 'built scene controls reset to the full frontage including canteen');
    await shot('production-wide');
    assert(errors.length === 0, `no production browser or WebGL errors: ${JSON.stringify(errors)}`);
  } else {
  await sleep(350);
  let state = await run('aps3d.state()');
  assert(state.wholeFrontageVisible && state.zoom === 98 && state.canteen, 'default wide view includes APS, stair tower, canteen and roofs');
  assert(state.canvasWidth === 640 && state.canvasHeight === 360 && state.boxes > 700, 'pixel render and spatial architecture are active');
  assert(await run('(() => { const r=document.querySelector("canvas").getBoundingClientRect(); return Math.abs(r.width-Math.min(innerWidth,innerHeight*16/9))<1; })()'), 'desktop scene uses the available window rather than a small centered panel');
  await shot('wide-afternoon');
  await run('aps3d.setZoom(56)'); await sleep(100);
  assert((await run('aps3d.state()')).wholeBuildingVisible, 'APS-only wide view still includes the original full building');
  await shot('aps-afternoon');
  await run('aps3d.setZoom(48)');
  assert(await run('document.querySelector("#framing").value === "custom"'), 'manual zoom does not misleadingly claim whole-building framing');
  await run('aps3d.setZoom(22)'); await shot('entrance-afternoon');
  await run('document.querySelector("canvas").focus()');
  const motionStart = await run('aps3d.state()'), before = motionStart.x;
  await key('KeyD', 'd', true); await sleep(200); await key('KeyD', 'd', false);
  const motionEnd = await run('aps3d.state()');
  assert(motionEnd.x > before, 'keyboard moves the character');
  assert(Math.abs(motionEnd.billboardAngle - motionStart.billboardAngle) < 0.00001, 'walking does not twist the sprite lighting or shadow');
  assert(motionEnd.stableShadowFilter && motionEnd.shadowMapSize >= 4096 && motionEnd.shadowMatrix.every((v,i) => v === motionStart.shadowMatrix[i]), 'shadow sampling and projection remain anchored while the camera follows');
  assert(Math.abs(motionEnd.contactHeight + 0.191) < 0.0001, 'soft foot shadow stays attached to the road surface');
  assert(!(await run('aps3d.sunOccluded()')), 'road position receives direct sun');
  await shot('walking-sun');
  await run('aps3d.setPosition(3.4,3.7)');
  await key('KeyW', 'w', true); await sleep(500); await key('KeyW', 'w', false);
  state = await run('aps3d.state()');
  assert(state.z > 3.53 && state.z < 3.7, 'stone column blocks forward walking');
  await run('aps3d.setPosition(0.7,1); document.querySelector("#character").click()');
  state = await run('aps3d.state()');
  assert(state.character === 'girl' && Math.abs(state.y - 0.045) < 0.001, 'character button and forecourt ground contact work');
  assert(await run('aps3d.sunOccluded()'), 'canopy geometry occludes sunlight as the student enters shade');
  await shot('girl-in-shade');
  await run('document.querySelector("#time").value="21"; document.querySelector("#time").dispatchEvent(new Event("change"))');
  const night = await run('aps3d.state()');
  assert(night.hour === 21 && night.lights > 2, 'night selector turns on the lamps');
  await shot('entrance-night');
  await run('aps3d.reset(); aps3d.setTime(8)'); await shot('wide-morning');
  await run('aps3d.setTime(12)'); await shot('wide-noon');
  await run('aps3d.setTime(21)'); await shot('wide-night');
  await run('document.querySelector("#reset").click()');
  state = await run('aps3d.state()');
  assert(state.hour === 16.5 && state.zoom === 98 && Math.abs(state.x - 0.7) < 0.01, 'reset restores full APS and canteen afternoon view');
  const angle = state.angle;
  await run('document.querySelector("#angle").click()');
  await sleep(100);
  assert((await run('aps3d.state()')).angle !== angle, 'camera button changes the view');
  await run('document.querySelector("#framing").value="28"; document.querySelector("#framing").dispatchEvent(new Event("change"))');
  await sleep(150);
  state = await run('aps3d.state()');
  assert(state.x === 51 && state.zoom === 28 && state.canteen, 'Canteen view opens the actual new canteen frontage');
  await shot('canteen-afternoon');
  await run('document.querySelector("canvas").focus()');
  await key('KeyW', 'w', true); await sleep(1750); await key('KeyW', 'w', false);
  state = await run('aps3d.state()');
  assert(state.z < 2.45 && state.z > -2 && Math.abs(state.y - 0.465) < 0.001, 'student walks through the railing gap and up the canteen steps');
  await key('KeyW', 'w', true);
  for (let i = 0; i < 50 && (await run('aps3d.state()')).z > -1.75; i++) await sleep(70);
  await key('KeyW', 'w', false);
  assert(await run('aps3d.sunOccluded()'), 'canteen awning shades the student');
  await shot('canteen-in-shade');
  await run('aps3d.setTime(21)'); await shot('canteen-night');
  await run('aps3d.setPosition(46.25,2.1)');
  await key('KeyW', 'w', true); await sleep(350); await key('KeyW', 'w', false);
  assert((await run('aps3d.state()')).z > 2.02, 'canteen columns block the student');
  await run('aps3d.setTime(16.5); aps3d.setPosition(29,5.3)');
  await key('KeyD', 'd', true); await sleep(500); await key('KeyD', 'd', false);
  assert((await run('aps3d.state()')).x > 30, 'APS road continues towards the canteen');
  await run('aps3d.reset()');
  for (const [name, width, height] of [['mobile-landscape', 844, 390], ['mobile-portrait', 390, 844]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    const fit = await run('(() => { const r=document.querySelector("#aps-frame").getBoundingClientRect(); return r.width<=innerWidth+1 && r.height<=innerHeight+1; })()');
    assert(fit, `${name} scene fits the viewport`);
    if (name === 'mobile-portrait') {
      const clear = await run(`(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect();
        const overlaps = (a,b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const canvas = rect('canvas'), tools = rect('.scene-tools'), pad = rect('.touch-pad'), heading = rect('.scene-heading');
        return !overlaps(canvas,tools) && !overlaps(canvas,pad) && !overlaps(canvas,heading) && !overlaps(tools,pad)
          && tools.bottom <= innerHeight && pad.bottom <= innerHeight
          && [...document.querySelectorAll('.touch-pad button')].every(button => button.getBoundingClientRect().height >= 44);
      })()`);
      assert(clear, 'portrait controls keep the full building clear and do not overlap');
    }
    await shot(name);
  }
  const beforeTouch = (await run('aps3d.state()')).x;
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  const touch = await run('(() => { const r=document.querySelector("[data-key=KeyD]").getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()');
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
  await sleep(180);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert((await run('aps3d.state()')).x > beforeTouch, 'touch movement button moves the character');
  assert(errors.length === 0, `no browser or WebGL errors: ${JSON.stringify(errors)}`);
  console.log(JSON.stringify({ state: await run('aps3d.state()'), captures: capture ? output : false }));
  await send('Page.navigate', { url: `${root}/?area=aps&spawn=apslobby` });
  for (let i = 0; i < 100 && !(await run('!!window.hau')); i++) await sleep(100);
  assert(await run('!!window.hau && !window.aps3d'), 'original game loads separately without the 3D trial');
  }
} finally { ws?.close(); chrome.kill(); }
