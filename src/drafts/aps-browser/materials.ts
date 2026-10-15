import * as THREE from 'three';
import { rng } from '../../engine/math';

type Kind = 'stucco' | 'stone' | 'road' | 'tile' | 'brick' | 'wood' | 'glass' | 'metal' | 'plain';
const PALETTE = { stucco: '#d7d6cb', stone: '#b6a385', road: '#899093', tile: '#d6d1c3', brick: '#a7957b', wood: '#8b6b4e', glass: '#455965', metal: '#8c9b9e' };

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const image = document.createElement('canvas');
  image.width = width; image.height = height;
  return [image, image.getContext('2d')!];
}

export function pixelTexture(image: HTMLCanvasElement | HTMLImageElement): THREE.Texture {
  const texture = image instanceof HTMLCanvasElement ? new THREE.CanvasTexture(image) : new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export class Materials {
  private cache = new Map<string, THREE.MeshLambertMaterial>();
  private images = new Map<Kind, HTMLCanvasElement>();

  get(kind: Kind, tint = '#ffffff', u = 1, v = 1): THREE.MeshLambertMaterial {
    const key = `${kind}:${tint}:${u}:${v}`;
    const found = this.cache.get(key);
    if (found) return found;
    let map: THREE.Texture | null = null;
    if (kind !== 'plain') {
      if (!this.images.has(kind)) this.images.set(kind, this.paint(kind));
      map = pixelTexture(this.images.get(kind)!);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(u, v);
    }
    // The native reference uses diffuse Lambert shading rather than shiny PBR.
    const material = new THREE.MeshLambertMaterial({ map, color: tint });
    this.cache.set(key, material);
    return material;
  }

  private paint(kind: Exclude<Kind, 'plain'>): HTMLCanvasElement {
    const [image, c] = canvas(128, 128);
    const random = rng(61015 + [...kind].reduce((n, ch) => n * 17 + ch.charCodeAt(0), 0));
    c.fillStyle = PALETTE[kind]; c.fillRect(0, 0, 128, 128);
    const data = c.getImageData(0, 0, 128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const i = (y * 128 + x) * 4;
      const noise = (random() - 0.5) * (kind === 'stucco' || kind === 'road' ? 2 : 5);
      for (let k = 0; k < 3; k++) data.data[i + k] += noise;
    }
    c.putImageData(data, 0, 0);
    if (kind === 'stone') {
      for (let y = 0; y < 128; y += 8) {
        c.fillStyle = '#8f8574'; c.fillRect(0, y, 128, 1);
        for (let x = ((y / 8) % 2) * -12; x < 128; x += 24) {
          c.fillStyle = '#8f8574'; c.fillRect(x, y, 1, 8);
          c.fillStyle = '#cec0a8'; c.fillRect(x + 1, y + 1, 23, 1);
          c.fillStyle = `rgba(246,226,190,${random() * 0.16})`; c.fillRect(x + 1, y + 2, 23, 5);
        }
      }
    } else if (kind === 'tile') {
      for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
        if ((x + y) % 64 < 2 || ((x - y + 128) % 64) < 2) { c.fillStyle = '#91645b'; c.fillRect(x, y, 1, 1); }
      }
    } else if (kind === 'brick') {
      for (let y = -16; y < 144; y += 16) for (let x = -16; x < 144; x += 16) {
        const horizontal = ((x + y) / 16) % 2 === 0;
        const bx = horizontal ? x : x + 1, by = horizontal ? y + 1 : y;
        c.fillStyle = '#786f5e'; c.fillRect(bx, by, horizontal ? 16 : 8, horizontal ? 8 : 16);
        c.fillStyle = random() > 0.4 ? '#b0a18a' : '#9d927c'; c.fillRect(bx + 1, by + 1, horizontal ? 14 : 6, horizontal ? 6 : 14);
      }
    } else if (kind === 'road') {
      c.fillStyle = '#a6aaa1';
      for (let i = 0; i < 120; i++) c.fillRect(Math.floor(random() * 128), Math.floor(random() * 128), 1 + Math.floor(random() * 2), 1);
    } else if (kind === 'glass') {
      const gradient = c.createLinearGradient(0, 0, 0, 128);
      gradient.addColorStop(0, '#a6adad'); gradient.addColorStop(1, '#929b9d');
      c.fillStyle = gradient; c.fillRect(0, 0, 128, 128);
      c.fillStyle = 'rgba(190,208,211,0.035)';
      for (let x = -70; x < 160; x += 73) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 8, 0); c.lineTo(x + 50, 128); c.lineTo(x + 42, 128); c.fill(); }
    } else if (kind === 'wood') {
      for (let y = 0; y < 128; y += 13) { c.fillStyle = '#5f5144'; c.fillRect(0, y, 128, 1); c.fillStyle = '#b29164'; c.fillRect(0, y + 1, 128, 1); }
    } else if (kind === 'stucco') {
      c.fillStyle = 'rgba(81,83,72,0.09)';
      for (let i = 0; i < 17; i++) c.fillRect(random() * 128, random() * 116, 1, 2 + random() * 9);
    }
    return image;
  }
}

export function leafMaterial(seed: number): THREE.MeshLambertMaterial {
  const [image, c] = canvas(128, 128);
  const random = rng(seed);
  const colors = ['#3a5650', '#48664f', '#61815a', '#89965b', '#a8ab70'];
  for (let i = 0; i < 2100; i++) {
    const x = 3 + Math.floor(random() * 122), y = 4 + Math.floor(random() * 116);
    const nx = (x - 64) / 60, ny = (y - 59) / 52;
    if (nx * nx + ny * ny > 0.84 + Math.sin(x * 0.22) * 0.1 + random() * 0.16) continue;
    c.fillStyle = colors[Math.max(0, Math.min(4, Math.floor((1 - y / 128) * 4 + random() * 2 - 1)))];
    c.fillRect(x - 2, y, 5, 1); c.fillRect(x - 1, y - 1, 3, 3);
  }
  return new THREE.MeshLambertMaterial({ map: pixelTexture(image), side: THREE.DoubleSide, alphaTest: 0.4, shadowSide: THREE.DoubleSide });
}

export function buildingSign(): THREE.Mesh {
  const [image, c] = canvas(1024, 64);
  const text = 'ARCHBISHOP PEDRO SANTOS BUILDING';
  c.font = '42px Arial, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#7a303c';
  c.fillText(text, 512, 46);
  const material = new THREE.MeshBasicMaterial({ map: pixelTexture(image), alphaTest: 0.3 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9.728, 0.608), material);
  mesh.position.set(0, 3.45, 3.635);
  mesh.receiveShadow = true;
  return mesh;
}

export function textPanel(text: string, width: number, height: number, color: string, background?: string): THREE.Mesh {
  const [image, c] = canvas(512, 96);
  if (background) { c.fillStyle = background; c.fillRect(0, 0, 512, 96); }
  c.font = 'bold 44px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = color;
  c.fillText(text, 256, 50, 486);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshLambertMaterial({ map: pixelTexture(image), alphaTest: 0.3, side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
  return mesh;
}
