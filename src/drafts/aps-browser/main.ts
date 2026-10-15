import * as THREE from 'three';
import { ApsScene, HOURS } from './scene';
import { Student, Character } from './student';
import { stablePixelShadows } from './shadows';
import './style.css';

const WORLD_W = 640, WORLD_H = 360;
const frame = document.querySelector<HTMLElement>('#aps-frame')!;
const canvas = document.querySelector<HTMLCanvasElement>('#aps-world')!;
const status = document.querySelector<HTMLElement>('#scene-status')!;
const time = document.querySelector<HTMLSelectElement>('#time')!;
const framing = document.querySelector<HTMLSelectElement>('#framing')!;
const character = document.querySelector<HTMLButtonElement>('#character')!;
const instructions = document.querySelector<HTMLElement>('#instructions')!;
const keyboard = new Set<string>(), pointers = new Map<number, string>();

async function start(): Promise<void> {
  stablePixelShadows();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(WORLD_W, WORLD_H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new ApsScene();
  // The browser trial starts wide enough to show the complete frontage and roof.
  const camera = new THREE.OrthographicCamera(-28, 28, 15.75, -15.75, 0.1, 220);
  const student = new Student(); scene.add(student);
  await student.load();

  let hour = 16.5, orbit = 0.12, width = 98, followX = 0;
  const q = new URLSearchParams(location.search);
  const initialHour = Number(q.get('hour') ?? 16.5);
  if (HOURS.includes(initialHour)) hour = initialHour;
  const canteenStart = q.get('view') === 'canteen';
  const initialZoom = Number(q.get('zoom') ?? (canteenStart ? 28 : 98));
  if (Number.isFinite(initialZoom)) width = THREE.MathUtils.clamp(initialZoom, 22, 110);
  student.setCharacter(q.get('char') === 'girl' ? 'girl' : 'boy');
  const initialX = Number(q.get('x') ?? (canteenStart ? 51 : 0.7)), initialZ = Number(q.get('z') ?? 5.3);
  if (Number.isFinite(initialX) && Number.isFinite(initialZ)) student.setPosition(initialX, initialZ);
  followX = student.position.x - 0.15;

  function setHour(value: number): void { hour = value; scene.setHour(value); time.value = String(value); }
  function setCharacter(who: Character): void { student.setCharacter(who); character.textContent = `Character: ${who === 'boy' ? 'Boy' : 'Girl'}`; }
  function setZoom(value: number): void {
    width = THREE.MathUtils.clamp(value, 22, 110);
    const preset = [98, 56, 36, 28, 22].find(value => Math.abs(width - value) < 0.01);
    framing.value = preset === undefined ? 'custom' : String(preset);
    camera.left = -width / 2; camera.right = width / 2;
    camera.top = width / (WORLD_W / WORLD_H) / 2; camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
  }
  function updateCamera(dt: number): void {
    followX = THREE.MathUtils.lerp(followX, student.position.x - 0.15, 1 - Math.exp(-dt * 4));
    const wide = THREE.MathUtils.clamp((width - 22) / 34, 0, 1);
    const campus = THREE.MathUtils.clamp((width - 56) / 42, 0, 1);
    const wingCenter = THREE.MathUtils.lerp(5.5 + followX * 0.1, 51, THREE.MathUtils.smoothstep(student.position.x, 14, 40));
    let center = THREE.MathUtils.lerp(THREE.MathUtils.lerp(followX, wingCenter, wide), 23.5, campus);
    // Move the camera in whole render pixels to avoid crawling facade/shadow edges.
    const pixelStep = width / (WORLD_W * Math.cos(orbit));
    center = Math.round(center / pixelStep) * pixelStep;
    const targetY = THREE.MathUtils.lerp(THREE.MathUtils.lerp(3.65, 8.4, wide), 10, campus);
    const distance = THREE.MathUtils.lerp(THREE.MathUtils.lerp(23, 60, wide), 90, campus);
    const lift = THREE.MathUtils.lerp(3.15, width * 0.24, wide);
    camera.position.set(center + Math.sin(orbit) * distance, targetY + lift, Math.cos(orbit) * distance);
    camera.lookAt(center, targetY, 0);
    student.faceCamera(camera);
  }
  function reset(): void {
    keyboard.clear(); pointers.clear(); student.setPosition(0.7, 5.3);
    orbit = 0.12; followX = 0; setHour(16.5); setZoom(98); updateCamera(1);
  }
  function resize(): void {
    const scale = Math.min(document.documentElement.clientWidth / WORLD_W, innerHeight / WORLD_H);
    frame.style.width = `${WORLD_W * scale}px`; frame.style.height = `${WORLD_H * scale}px`;
  }
  function held(...codes: string[]): boolean { return codes.some(code => keyboard.has(code) || [...pointers.values()].includes(code)); }
  function update(dt: number): void {
    student.move(Number(held('KeyD', 'ArrowRight')) - Number(held('KeyA', 'ArrowLeft')),
      Number(held('KeyS', 'ArrowDown')) - Number(held('KeyW', 'ArrowUp')), held('ShiftLeft', 'ShiftRight'), dt);
    orbit = THREE.MathUtils.clamp(orbit + (Number(held('KeyE')) - Number(held('KeyQ'))) * dt * 0.25, -0.25, 0.25);
    updateCamera(dt);
    renderer.render(scene, camera);
  }

  time.addEventListener('change', () => setHour(Number(time.value)));
  framing.addEventListener('change', () => {
    const value = Number(framing.value);
    if (value === 28) { student.setPosition(51, 5.3); followX = 50.85; }
    else if (value <= 56 && student.position.x > 18) { student.setPosition(0.7, 5.3); followX = 0.55; }
    setZoom(value); updateCamera(1);
  });
  character.addEventListener('click', () => setCharacter(student.who === 'boy' ? 'girl' : 'boy'));
  document.querySelector('#reset')!.addEventListener('click', reset);
  document.querySelector('#angle')!.addEventListener('click', () => { orbit = orbit >= 0.12 ? -0.18 : orbit < 0 ? 0 : 0.18; });
  canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));
  canvas.addEventListener('wheel', event => { event.preventDefault(); setZoom(width + event.deltaY * 0.04); }, { passive: false });
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.target instanceof HTMLSelectElement) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code) && event.target === canvas) event.preventDefault();
    keyboard.add(event.code);
    if (event.repeat) return;
    if (event.code === 'KeyT') setHour(HOURS[(HOURS.indexOf(hour) + 1) % HOURS.length]);
    if (event.code === 'KeyC') setCharacter(student.who === 'boy' ? 'girl' : 'boy');
    if (event.code === 'KeyR') reset();
    if (event.code === 'KeyH') instructions.hidden = !instructions.hidden;
    if (event.code === 'Equal' || event.code === 'NumpadAdd') setZoom(width - 4);
    if (event.code === 'Minus' || event.code === 'NumpadSubtract') setZoom(width + 4);
  });
  window.addEventListener('keyup', event => keyboard.delete(event.code));
  window.addEventListener('blur', () => { keyboard.clear(); pointers.clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { keyboard.clear(); pointers.clear(); } });
  document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId); pointers.set(event.pointerId, button.dataset.key!); button.setAttribute('aria-pressed', 'true');
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, event => {
      pointers.delete((event as PointerEvent).pointerId); button.setAttribute('aria-pressed', 'false');
    });
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); keyboard.clear(); pointers.clear();
    renderer.setAnimationLoop(null);
    showError('The graphics connection was interrupted. Reload the scene to continue.');
  });
  window.addEventListener('resize', resize);
  setHour(hour); setCharacter(student.who); setZoom(width); resize(); updateCamera(1);
  renderer.render(scene, camera);
  document.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('button, select').forEach(control => { control.disabled = false; });
  status.hidden = true;
  let previous = performance.now();
  renderer.setAnimationLoop(now => { const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000)); previous = now; update(dt); });

  if (import.meta.env.DEV) {
    (window as unknown as { aps3d: unknown }).aps3d = {
      ready: true, setTime: setHour, setCharacter, setZoom, reset,
      setPosition: (x: number, z: number) => student.setPosition(x, z),
      setAngle: (angle: number) => { orbit = THREE.MathUtils.clamp(angle, -0.25, 0.25); },
      sunOccluded: () => {
        scene.updateMatrixWorld(true);
        const origin = student.position.clone().add(new THREE.Vector3(0, 1.3, 0));
        const ray = new THREE.Raycaster(origin, scene.sun.position.clone().sub(scene.sun.target.position).normalize(), 0.05, 100);
        return ray.intersectObjects(scene.children.filter(object => object instanceof THREE.Mesh), false).length > 0;
      },
      state: () => ({ ...student.state(), hour, zoom: width, angle: orbit, boxes: scene.boxCount,
        canteen: !!scene.getObjectByName('APS Canteen sign'),
        shadowMapSize: scene.sun.shadow.mapSize.x, shadowMatrix: scene.sun.shadow.matrix.elements.slice(),
        stableShadowFilter: THREE.ShaderChunk.shadowmap_pars_fragment.includes('floor( shadowCoord.xy * shadowMapSize )'),
        drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lights: scene.children.filter(child => child instanceof THREE.Light && child.visible).length,
        canvasWidth: canvas.width, canvasHeight: canvas.height,
        wholeBuildingVisible: [-18.3, 31.3].every(x => [0, 21.5].every(y => [-4.2, 4.2].every(z => {
          const p = new THREE.Vector3(x, y, z).project(camera);
          return Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
        }))),
        wholeFrontageVisible: [-18.3, 66.95].every(x => [0, 23.3].every(y => [-7.5, 4.2].every(z => {
          const p = new THREE.Vector3(x, y, z).project(camera);
          return Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
        }))),
      }),
    };
  }
  if (import.meta.hot) import.meta.hot.dispose(() => { renderer.setAnimationLoop(null); renderer.dispose(); });
}

function showError(message: string): void {
  status.hidden = false;
  status.replaceChildren();
  const text = document.createElement('p'); text.textContent = message;
  const retry = document.createElement('button'); retry.textContent = 'Reload scene'; retry.onclick = () => location.reload();
  const back = document.createElement('a'); back.textContent = 'Return to the original game'; back.href = './';
  status.append(text, retry, back);
}

start().catch(error => {
  console.error(error);
  showError('APS could not load. This scene needs WebGL 2 and graphics acceleration. Try Chrome or Edge, or return to the original game.');
});
