import * as THREE from 'three';
import { Materials, pixelTexture, textPanel } from './materials';

type XYZ = [number, number, number];
interface Builder {
  materials: Materials;
  box: (name: string, size: XYZ, at: XYZ, material: THREE.Material) => void;
  rod: (from: XYZ, to: XYZ, radius: number, color: string) => void;
  window: (x: number, y: number, z: number, w?: number, h?: number) => void;
  pot: (x: number, z: number) => void;
  add: (object: THREE.Object3D) => void;
  lamp: (light: THREE.Light) => void;
}

export const CANTEEN = { left: 36.5, right: 65.5, center: 51, floor: 0.45, roof: 18.05 };
export const CANTEEN_PIERS = [36.8, 46.25, 55.75, 65.2];
export const PATIO_TABLES = [[32.8, 2.2], [39.5, 2.2], [59.7, 2.2]] as const;

/** Frontage order from the walk photos: balcony block, stair tower, canteen. */
export function buildCanteen(b: Builder): void {
  const { materials: m, box, rod } = b;
  const cream = m.get('stucco', '#fff8e8', 3, 2), white = m.get('stucco', '#fffef5');
  const steel = m.get('plain', '#414b50'), stone = m.get('stone', '#ffffff', 1, 2);

  // The narrow white stair tower separates the two wings.
  box('Stair tower', [5.2, 23, 6.8], [33.9, 11.5, -3.2], white);
  box('Stair tower cap', [5.5, 0.25, 7], [33.9, 23.1, -3.2], white);
  for (const y of [5.8, 6.5, 12, 12.7]) box('Tower ledge', [5.35, 0.12, 0.2], [33.9, y, 0.3], white);
  for (let y = 4; y < 23; y += 3) {
    box('Stair landing window', [0.65, 1.7, 0.07], [31.72, y, 0.24], m.get('glass'));
  }
  box('Tower door', [1.1, 2.5, 0.08], [31.9, 1.25, 0.25], m.get('plain', '#45494a'));

  // Four classroom floors over the open ground-floor canteen.
  box('Canteen upper floors', [29, 12.4, 7.4], [51, 11.65, -3.4], cream);
  box('Canteen roof parapet', [29.4, 0.65, 7.6], [51, 18.05, -3.4], white);
  box('Weathered roof edge', [29.4, 0.13, 0.18], [51, 18.35, 0.5], m.get('plain', '#8c8e86'));
  for (let floor = 0; floor < 4; floor++) {
    const y = 6.5 + floor * 3.05;
    for (let bay = 0; bay < 6; bay++) {
      const x = 38.95 + bay * 4.82;
      b.window(x, y + 1.2, 0.35, 3.9, 1.4);
      box('Projecting window box', [4.28, 0.65, 0.65], [x, y + 0.14, 0.48], white);
      if ((floor + bay) % 3 !== 0) for (let line = 0; line < 3; line++) {
        box('Window blind', [3.8, 0.045, 0.03], [x, y + 1.15 + line * 0.18, 0.465], m.get('plain', '#aaa79b'));
      }
    }
  }
  for (let bay = 0; bay <= 6; bay++) box('Canteen facade pier', [0.23, 12.4, 0.28], [36.5 + bay * 4.83, 11.65, 0.4], white);

  box('Canteen ceiling', [29.1, 0.3, 8.5], [51, 5.3, -2.7], white);
  box('Open canteen tiled floor', [29, 0.2, 9.8], [51, 0.35, -2.4], m.get('tile', '#ffffff', 8, 3));
  // No perimeter wall: the food stalls stand inside an open hall.
  for (let i = 0; i < CANTEEN_PIERS.length; i++) {
    const x = CANTEEN_PIERS[i];
    box('Canteen column', [0.65, 4.75, 0.65], [x, 2.825, 1.45], white);
    box('Canteen stone facing', [0.68, 2.1, 0.68], [x, 1.5, 1.45], i === 3 ? m.get('plain', '#d1ad3d') : stone);
    box('Canteen column cap', [0.83, 0.12, 0.83], [x, 5.15, 1.45], white);
  }
  // Three broad tiled steps, centered in the gap in the rail.
  for (let step = 0; step < 3; step++) box('Canteen entrance step', [4, (step + 1) * 0.15, 0.46], [51, (step + 1) * 0.075, 3.03 - step * 0.44], white);
  for (const [left, right] of [[36.5, 48.8], [53.2, 65.5]]) {
    for (const y of [0.65, 1.05]) box('Patio rail', [right - left, 0.045, 0.045], [(left + right) / 2, y, 2.68], steel);
    for (let x = left; x < right; x += 1.3) box('Patio rail post', [0.045, 1.05, 0.045], [x, 0.525, 2.68], steel);
  }

  // Blue-gray sheet awning with truss, red trim and scalloped valance.
  box('Canteen blue awning', [30, 0.13, 3.2], [51, 5.12, 1.6], m.get('plain', '#526e8a'));
  for (let x = 36; x <= 66; x += 0.7) box('Awning sheet seam', [0.025, 0.045, 3.2], [x, 5.2, 1.6], m.get('plain', '#8196a8'));
  box('Awning red stripe', [30, 0.11, 0.1], [51, 4.92, 3.2], m.get('plain', '#8c4843'));
  for (let x = 36.5; x < 65; x += 2.4) {
    rod([x, 4.8, 2.95], [x + 1.2, 4.5, 2.95], 0.018, '#424c52');
    rod([x + 1.2, 4.5, 2.95], [x + 2.4, 4.8, 2.95], 0.018, '#424c52');
  }
  const valance = document.createElement('canvas'); valance.width = 256; valance.height = 16;
  const c = valance.getContext('2d')!; c.fillStyle = '#ded8c8'; c.fillRect(0, 0, 256, 4);
  for (let x = 4; x < 256; x += 8) { c.beginPath(); c.arc(x, 3, 4, 0, Math.PI); c.fill(); }
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.4), new THREE.MeshLambertMaterial({ map: pixelTexture(valance), alphaTest: 0.4, side: THREE.DoubleSide }));
  edge.position.set(51, 4.72, 3.24); edge.castShadow = edge.receiveShadow = true; b.add(edge);
  const canteenSign = textPanel('APS CANTEEN', 3.5, 0.52, '#fff4dc', '#526e75');
  canteenSign.name = 'APS Canteen sign'; canteenSign.position.set(51, 4.8, 3.29); b.add(canteenSign);

  const stalls = [['YUM-YUMS', '#eee3cc', '#34528a'], ['GRANNY JINGS', '#c36f59', '#fff3da'], ['BYFROST', '#426db4', '#ffffff']];
  for (let i = 0; i < 3; i++) {
    const x = 41 + i * 9.8;
    box('Food stall counter', [5, 1.05, 1.1], [x, 0.975, -3.15], m.get('stucco', '#f5e5c5'));
    box('Food display case', [4.8, 0.45, 0.7], [x, 1.72, -3.15], m.get('glass', '#d7eee5'));
    box('Stall counter trim', [5.1, 0.08, 1.18], [x, 1.5, -3.15], m.get('plain', '#b95442'));
    for (let tray = 0; tray < 5; tray++) box('Food tray', [0.65, 0.08, 0.44], [x - 1.7 + tray * 0.85, 1.99, -3.15], m.get('plain', ['#b57738', '#d8b55e', '#984c35'][tray % 3]));
    const [name, bg, fg] = stalls[i], sign = textPanel(name, 4.4, 0.7, fg, bg);
    sign.position.set(x, 3.25, -3.05); b.add(sign);
    for (const dx of [-2.35, 2.35]) box('Stall sign support', [0.035, 1.8, 0.035], [x + dx, 2.7, -3.2], steel);
    const light = new THREE.PointLight('#ffd79d', 15, 7, 2); light.position.set(x, 3.8, -1.2); b.lamp(light);
  }

  // The familiar brick patio, rusty red umbrellas, round tables and slatted seats.
  box('Canteen brick patio', [35, 0.08, 4.6], [48.5, -0.04, 1.7], m.get('brick', '#ffffff', 12, 2));
  for (const [x, z] of PATIO_TABLES) umbrella(b, x, z, x === 39.5 ? '#b96058' : '#9c6250');
  for (const x of [37.6, 64.2]) b.pot(x, 2.1);
  // Side wall and exterior fire escape at the far end.
  box('Canteen end wall', [0.25, 17.4, 7.2], [65.65, 9.1, -3.4], cream);
  for (let floor = 1; floor <= 4; floor++) {
    const y = 4 + floor * 3;
    box('Fire escape landing', [1.2, 0.09, 2], [66.3, y, -1.2], steel);
    rod([66.6, y, -2.1], [66.6, y + 3, -0.3], 0.035, '#414b50');
    rod([66.6, y + 0.8, -2.1], [66.6, y + 3.8, -0.3], 0.025, '#414b50');
  }
}

function umbrella(b: Builder, x: number, z: number, color: string): void {
  const m = b.materials, stem = m.get('plain', '#4d4740');
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.05, 0.65, 8, 1, true), m.get('plain', color));
  roof.material.side = THREE.DoubleSide; roof.position.set(x, 3.05, z); roof.rotation.y = Math.PI / 8;
  roof.name = 'Patio umbrella'; roof.castShadow = roof.receiveShadow = true; b.add(roof);
  b.box('Umbrella pole', [0.06, 3.35, 0.06], [x, 1.675, z], stem);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 16), m.get('wood'));
  table.position.set(x, 0.83, z); table.castShadow = table.receiveShadow = true; b.add(table);
  b.box('Table pedestal', [0.09, 0.8, 0.09], [x, 0.4, z], stem);
  for (const dx of [-1.2, 1.2]) {
    for (const dy of [0.5, 0.88, 1.05]) b.box('Patio chair slat', [0.55, 0.12, 0.11], [x + dx, dy, z - (dy > 0.6 ? 0.24 : 0)], m.get('wood'));
    for (const leg of [-0.23, 0.23]) b.box('Chair leg', [0.035, 0.5, 0.45], [x + dx + leg, 0.25, z], stem);
  }
}
