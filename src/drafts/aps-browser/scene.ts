import * as THREE from 'three';
import { Materials, buildingSign, leafMaterial, pixelTexture } from './materials';
import { buildCanteen, CANTEEN_PIERS, PATIO_TABLES } from './canteen';

export const COLUMN_X = [-7.5, -3.4, 3.4, 7.5];
export const HOURS = [8, 12, 16.5, 21];
type XYZ = [number, number, number];
interface BoxBatch { size: XYZ; material: THREE.Material; positions: XYZ[] }

export function blocked(x: number, z: number): boolean {
  if (COLUMN_X.some(column => Math.abs(x - column) < 0.48 && Math.abs(z - 3.05) < 0.48)) return true;
  if (x > 30.95 && x < 36.8 && z < 0.65) return true; // solid stair tower
  if (CANTEEN_PIERS.some(column => Math.abs(x - column) < 0.58 && Math.abs(z - 1.45) < 0.58)) return true;
  if (x > 36.3 && x < 65.7 && (x < 48.8 || x > 53.2) && Math.abs(z - 2.68) < 0.22) return true;
  if ([41, 50.8, 60.6].some(stall => Math.abs(x - stall) < 2.75 && Math.abs(z + 3.15) < 0.8)) return true;
  return PATIO_TABLES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 1.12);
}

export function floorHeight(x: number, z: number): number {
  if (x >= 36.5 && x <= 65.5 && z < 2.45) return 0.45;
  if (x > 49 && x < 53 && z <= 3.26 && z >= 2.45) return z > 2.8 ? 0.15 : 0.3;
  if (z > 4.135) return -0.2;
  if (z > 3.85) return 0;
  return Math.abs(x) < 8.75 ? 0.03 : -0.04;
}

/** The same approximate entrance geometry as the native trial, batched for WebGL. */
export class ApsScene extends THREE.Scene {
  readonly sun = new THREE.DirectionalLight('#ffd2a1', 3);
  readonly ambient = new THREE.AmbientLight('#b0b8ba', 2.7);
  private localLights: THREE.Light[] = [];
  private materials = new Materials();
  private batches = new Map<string, BoxBatch>();
  private skyCanvas = document.createElement('canvas');
  private skyTexture: THREE.Texture;
  private roomGlass?: THREE.MeshLambertMaterial;
  boxCount = 0;

  constructor() {
    super();
    this.skyCanvas.width = 32; this.skyCanvas.height = 128;
    this.skyTexture = pixelTexture(this.skyCanvas);
    this.background = this.skyTexture;
    this.fog = new THREE.Fog('#c1c5bb', 10, 480);
    this.add(this.ambient, this.sun, this.sun.target);
    this.sun.target.position.set(22, 7, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    Object.assign(this.sun.shadow.camera, { left: -55, right: 55, top: 42, bottom: -38, near: 0.5, far: 180 });
    this.sun.shadow.bias = -0.000035;
    this.sun.shadow.normalBias = 0.018;
    this.sun.shadow.radius = 2;
    this.sun.shadow.intensity = 0.94;
    this.entrance(); this.street();
    buildCanteen({ materials: this.materials,
      box: (...args) => this.box(...args), rod: (...args) => this.rod(...args),
      window: (...args) => this.windowAt(...args), pot: (...args) => this.pot(...args),
      add: object => { this.add(object); }, lamp: light => { this.add(light); this.localLights.push(light); },
    });
    this.flushBoxes();
    this.setHour(16.5);
  }

  private box(name: string, size: XYZ, at: XYZ, material: THREE.Material): void {
    const key = `${size.join(',')}:${material.uuid}`;
    if (!this.batches.has(key)) this.batches.set(key, { size, material, positions: [] });
    this.batches.get(key)!.positions.push(at);
    this.boxCount++;
    // Names describe the authored architecture in the inspector, not UI text.
    material.name ||= name;
  }

  private flushBoxes(): void {
    const dummy = new THREE.Object3D();
    for (const { size, material, positions } of this.batches.values()) {
      const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), material, positions.length);
      mesh.name = material.name;
      positions.forEach((at, i) => { dummy.position.set(...at); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); });
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.add(mesh);
    }
    this.batches.clear();
  }

  private rod(from: XYZ, to: XYZ, radius: number, color: string): void {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius, a.distanceTo(b), 8), this.materials.get('plain', color));
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    mesh.castShadow = mesh.receiveShadow = true;
    this.add(mesh);
  }

  private windowAt(x: number, y: number, z: number, w = 2.05, h = 1.05): void {
    const m = this.materials;
    this.box('Window reveal', [w + 0.15, h + 0.15, 0.07], [x, y, z], m.get('plain', '#333e49'));
    if (!this.roomGlass) {
      this.roomGlass = m.get('glass').clone();
      this.roomGlass.emissive.set('#ffc281');
      this.roomGlass.emissiveIntensity = 0;
    }
    const occupied = ((Math.round(x * 7 + y * 11) % 4) + 4) % 4 === 0;
    this.box('Window glass', [w, h, 0.035], [x, y, z + 0.05], occupied ? this.roomGlass : m.get('glass'));
    for (const dx of [-w / 2, 0, w / 2]) this.box('Window frame', [0.035, h + 0.08, 0.05], [x + dx, y, z + 0.09], m.get('plain', '#bbbcb3'));
    for (const dy of [-h / 2, h / 2]) this.box('Window frame', [w + 0.09, 0.045, 0.075], [x, y + dy, z + 0.09], m.get('plain', '#bbbcb3'));
    this.box('Window sill', [w + 0.23, 0.08, 0.24], [x, y - h / 2 - 0.08, z + 0.11], m.get('stucco'));
  }

  private entrance(): void {
    const m = this.materials, wall = m.get('stucco', '#ffffff', 3, 2), slab = m.get('stucco', '#f3f0e5'), metal = m.get('plain', '#888f90');
    this.box('Classroom wall', [36, 13.4, 0.36], [0, 6.7, -3.15], wall);
    for (const x of [-18, 18]) this.box('Building return', [0.35, 13.4, 3], [x, 6.7, -1.8], wall);
    for (let floor = 0; floor < 4; floor++) {
      const y = 3.35 + floor * 3.05;
      this.box('Corridor slab', [36.6, 0.26, 3.4], [0, y, -1.7], slab);
      if (floor < 3) {
        this.box('Balcony parapet', [36.25, 0.85, 0.19], [0, y + 0.55, -0.12], wall);
        this.box('Balcony cap', [36.4, 0.07, 0.28], [0, y + 1, -0.12], slab);
        this.box('Corridor handrail', [36.1, 0.025, 0.035], [0, y + 1.35, -0.12], metal);
        for (let x = -18; x <= 18; x += 3) this.box('Rail upright', [0.025, 0.35, 0.035], [x, y + 1.18, -0.12], metal);
      }
    }
    for (let x = -18; x <= 18; x += 3) {
      this.box('Facade pier', [0.23, 12.8, 0.38], [x, 6.4, -0.2], slab);
      for (let floor = 0; floor < 4; floor++) if (x < 18 && (floor > 0 || Math.abs(x) > 2)) this.windowAt(x + 1.4, 1.9 + floor * 3.05, -2.94);
      if (x % 9 === 0) this.box('Rain pipe', [0.065, 12.7, 0.09], [x + 0.21, 6.35, -0.02], m.get('metal'));
    }
    this.box('Roof fascia', [36.8, 0.7, 0.25], [0, 13, -0.05], m.get('metal', '#e6e9e3'));
    for (let x = -18; x <= 18; x++) this.box('Fascia joint', [0.018, 0.66, 0.025], [x, 13, 0.09], metal);
    this.box('Entrance canopy', [17.2, 0.42, 4.4], [0, 3.45, 1.4], slab);
    this.box('Canopy edge', [17.35, 0.08, 0.16], [0, 3.65, 3.62], m.get('plain', '#fff5dd'));
    for (const x of COLUMN_X) {
      this.box('Stone pier', [0.56, 3.22, 0.56], [x, 1.61, 3.05], m.get('stone', '#ffffff', 1, 3));
      this.box('Pier capital', [0.7, 0.13, 0.7], [x, 3.15, 3.05], slab);
      this.box('Pier foot', [0.67, 0.16, 0.67], [x, 0.08, 3.05], m.get('stone'));
    }
    this.box('Entrance tiles', [17.5, 0.09, 5.4], [0, -0.015, 1.15], m.get('tile', '#ffffff', 5, 2));
    this.box('Entrance step', [17.6, 0.14, 0.32], [0, -0.06, 3.95], m.get('stucco', '#bbb9ad'));
    this.box('Door recess', [2.6, 2.8, 0.12], [0, 1.4, -2.9], m.get('plain', '#282d37'));
    for (const x of [-0.63, 0.63]) {
      this.box('Door glass', [1.12, 2.47, 0.08], [x, 1.35, -2.78], m.get('glass', '#aab9ba'));
      this.box('Door handle', [0.035, 0.43, 0.08], [x * 0.18, 1.2, -2.7], metal);
    }
    this.box('Door center', [0.055, 2.6, 0.08], [0, 1.35, -2.71], metal);
    this.windowAt(-5.3, 1.65, -2.94, 2.2, 0.75);
    this.box('Cashier counter', [2.5, 0.14, 0.38], [-5.3, 1.1, -2.7], m.get('stone'));
    this.add(buildingSign());
    const strip = new THREE.MeshLambertMaterial({ color: '#ffe8bc', emissive: '#ffcb8b', emissiveIntensity: 0.35 });
    for (const x of [-6, -2, 2, 6]) {
      this.box('Canopy strip light', [0.75, 0.035, 0.11], [x, 3.22, 1.2], strip);
      const light = new THREE.PointLight('#ffcf92', 5, 4.2, 2);
      light.position.set(x, 2.98, 1.2); this.add(light); this.localLights.push(light);
    }
    this.box('Tall block wall', [13, 21.3, 0.35], [24.5, 10.65, -4], wall);
    for (let floor = 0; floor < 6; floor++) {
      const y = 3.35 + floor * 3;
      this.box('Tall block slab', [13.4, 0.32, 4.2], [24.5, y, -1.9], slab);
      this.box('Tall block parapet', [13.1, 0.93, 0.25], [24.5, y + 0.61, 0.05], wall);
      for (const x of [19.8, 23, 26.2, 29.4]) this.windowAt(x, y + 1.9, -3.78, 2.3, 0.8);
    }
    for (const x of [18.1, 24.5, 30.9]) this.box('Tall block pier', [0.44, 21.3, 0.5], [x, 10.65, -0.05], slab);
    this.box('Tall block roof', [13.5, 0.28, 4.2], [24.5, 21.35, -1.9], slab);
  }

  private street(): void {
    const m = this.materials;
    this.box('Asphalt', [160, 0.2, 95], [20, -0.3, 36], m.get('road', '#ffffff', 24, 23));
    this.box('Sidewalk', [120, 0.18, 5], [20, -0.13, 1.35], m.get('stucco', '#cfcdc1', 16, 2));
    this.box('Kerb', [120, 0.21, 0.27], [20, -0.105, 4], m.get('stucco', '#bfc4bc'));
    for (let x = -35; x < 78; x += 2) this.box('Paving joint', [0.014, 0.008, 4.9], [x, -0.034, 1.35], m.get('plain', '#999f99'));
    for (const x of [-12.8, -10.3, 10.3, 13]) this.pot(x, 2.65);
    this.tree([-13.5, 0, 2], 7.1, 610); this.tree([12.7, 0, 3], 6.5, 611);
    this.tree([-8.8, -0.15, 11], 8.6, 612); this.tree([21, -0.15, 11.8], 8.1, 613);
    for (const x of [-11.5, 11.4]) this.lantern(x);
    for (const x of [-10.2, 11]) {
      for (const dx of [-1, 1]) this.box('Bench leg', [0.09, 0.45, 0.45], [x + dx, 0.225, 1], m.get('plain', '#3d4c4c'));
      for (const z of [-0.17, 0, 0.17]) this.box('Bench plank', [2.4, 0.07, 0.145], [x, 0.47, 1 + z], m.get('wood'));
      for (const y of [0.75, 0.93]) this.box('Bench back', [2.4, 0.14, 0.08], [x, y, 0.76], m.get('wood'));
    }
    for (let i = 0; i < 15; i++) {
      const h = 5 + (i * 17) % 9;
      this.box('Distant campus', [8, h, 5], [-55 + i * 10, h / 2, -19], m.get('plain', '#93a7ad'));
    }
  }

  private pot(x: number, z: number): void {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.3, 0.65, 8), this.materials.get('plain', '#a66d50'));
    pot.position.set(x, 0.325, z); pot.castShadow = pot.receiveShadow = true; this.add(pot);
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7;
      this.rod([x, 0.6, z], [x + Math.cos(a) * 0.45, 1.05 + i % 3 * 0.16, z + Math.sin(a) * 0.4], 0.045, '#708754');
    }
  }

  private tree(at: XYZ, height: number, seed: number): void {
    const [x, y, z] = at;
    this.rod(at, [x + 0.1, y + height * 0.68, z], 0.13, '#645e50');
    const material = leafMaterial(seed), geometry = new THREE.PlaneGeometry(4.48, 4.48);
    for (let i = 0; i < 4; i++) {
      const a = i * 2.3, offset: XYZ = [x + Math.cos(a) * 0.9, y + height * (0.6 + i % 2 * 0.16), z + Math.sin(a) * 0.6];
      this.rod([x, y + height * 0.4, z], offset, 0.07, '#645e50');
      const leaves = new THREE.Mesh(geometry, material);
      leaves.position.set(...offset); leaves.rotation.y = i % 2 * 0.7;
      leaves.castShadow = leaves.receiveShadow = true; this.add(leaves);
    }
  }

  private lantern(x: number): void {
    const metal = this.materials.get('plain', '#66503b');
    this.box('Lantern foot', [0.28, 0.18, 0.28], [x, 0.09, 3.9], metal);
    this.box('Lantern post', [0.09, 3.4, 0.09], [x, 1.7, 3.9], metal);
    this.box('Lantern crossbar', [1.15, 0.07, 0.07], [x, 3.45, 3.9], metal);
    const glass = new THREE.MeshLambertMaterial({ color: '#f2cc92', emissive: '#ffcc88', emissiveIntensity: 0.5 });
    for (const dx of [-0.5, 0.5]) {
      this.box('Lantern glass', [0.22, 0.38, 0.22], [x + dx, 3.15, 3.9], glass);
      this.box('Lantern cap', [0.3, 0.07, 0.3], [x + dx, 3.38, 3.9], metal);
    }
    const light = new THREE.SpotLight('#ffd194', 36, 9, Math.PI * 0.36, 0.65, 2);
    light.position.set(x, 3.12, 3.9); light.target.position.set(x, 0, 3.9);
    light.castShadow = true; light.shadow.mapSize.set(512, 512); light.shadow.normalBias = 0.025;
    this.add(light, light.target); this.localLights.push(light);
  }

  setHour(hour: number): void {
    const night = hour >= 19 || hour < 6, noon = hour >= 10 && hour < 15, morning = hour < 10 && !night;
    this.sun.position.set(22 + (night || morning ? 55 : -55), 7 + (night ? 58 : noon ? 95 : 44), noon ? 18 : 60);
    this.sun.color.set(night ? '#a7bee5' : noon ? '#fff4de' : '#ffce96');
    this.sun.intensity = night ? 0.6 : noon ? 2.8 : 3.15;
    this.ambient.color.set(night ? '#7185bd' : '#b0b8ba');
    this.ambient.intensity = night ? 1.05 : 2.7;
    if (this.roomGlass) this.roomGlass.emissiveIntensity = night ? 0.45 : 0;
    const top = night ? '#101c39' : '#5d8aaf', bottom = night ? '#364566' : noon ? '#c7d9dc' : '#edd3ae';
    const c = this.skyCanvas.getContext('2d')!, gradient = c.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, top); gradient.addColorStop(1, bottom); c.fillStyle = gradient; c.fillRect(0, 0, 32, 128);
    this.skyTexture.needsUpdate = true;
    (this.fog as THREE.Fog).color.set(night ? '#364566' : '#c1c5bb');
    this.localLights.forEach(light => { light.visible = night; });
  }
}
