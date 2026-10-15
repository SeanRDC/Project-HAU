import * as THREE from 'three';
import boyIdle from '../../game/sprites/boy/idle.png';
import boyWalk from '../../game/sprites/boy/walk.png';
import girlIdle from '../../game/sprites/girl/idle.png';
import girlWalk from '../../game/sprites/girl/walk.png';
import { blocked, floorHeight } from './scene';

export type Character = 'boy' | 'girl';
interface Sheet { texture: THREE.Texture; frames: number; aspect: number }

export class Student extends THREE.Group {
  private sheets = new Map<string, Sheet>();
  private material = new THREE.MeshLambertMaterial({ alphaTest: 0.35, side: THREE.DoubleSide, shadowSide: THREE.DoubleSide });
  private depth = new THREE.MeshDepthMaterial({ alphaTest: 0.35, depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  readonly body = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
  who: Character = 'boy';
  private facing = 1;
  private phase = 0;
  private previous = '';
  private distance = 0;
  private frame = 0;
  private viewDirection = new THREE.Vector3();
  private contact: THREE.Mesh;

  constructor() {
    super();
    this.name = 'Student';
    this.body.name = 'Lit pixel sprite';
    this.body.castShadow = this.body.receiveShadow = true;
    this.body.customDepthMaterial = this.depth;
    this.body.position.y = 1.83 / 2;
    this.add(this.body);
    const image = document.createElement('canvas'); image.width = image.height = 32;
    const c = image.getContext('2d')!, gradient = c.createRadialGradient(16, 16, 1, 16, 16, 15);
    gradient.addColorStop(0, 'rgba(20,25,29,0.24)'); gradient.addColorStop(1, 'rgba(20,25,29,0)');
    c.fillStyle = gradient; c.fillRect(0, 0, 32, 32);
    this.contact = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(image), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    this.contact.name = 'Soft foot contact'; this.contact.rotation.x = -Math.PI / 2; this.contact.position.y = -0.006;
    this.add(this.contact);
    this.setPosition(0.7, 5.3);
  }

  async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    await Promise.all([
      ['boy:idle', boyIdle, 12], ['boy:walk', boyWalk, 9],
      ['girl:idle', girlIdle, 12], ['girl:walk', girlWalk, 6],
    ].map(async ([key, url, frames]) => {
      const texture = await loader.loadAsync(url as string);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.repeat.set(1 / (frames as number), 1);
      const image = texture.image as HTMLImageElement;
      this.sheets.set(key as string, { texture, frames: frames as number, aspect: image.width / (frames as number) / image.height });
    }));
    this.animate(false, 0);
  }

  setCharacter(who: Character): void { this.who = who; this.phase = 0; this.animate(false, 0); }

  setPosition(x: number, z: number): boolean {
    x = THREE.MathUtils.clamp(x, -17, 67); z = THREE.MathUtils.clamp(z, x > 36.5 && x < 65.5 ? -6.4 : -1, 8.8);
    if (blocked(x, z)) return false;
    this.position.set(x, floorHeight(x, z) + 0.015, z);
    return true;
  }

  move(x: number, z: number, running: boolean, dt: number): void {
    const magnitude = Math.hypot(x, z), speed = running ? 4.2 : 2.4;
    const step = magnitude ? speed * dt / magnitude : 0;
    const oldX = this.position.x, oldZ = this.position.z;
    this.setPosition(this.position.x + x * step, this.position.z);
    this.setPosition(this.position.x, this.position.z + z * step);
    const travelled = Math.hypot(this.position.x - oldX, this.position.z - oldZ);
    this.distance += travelled;
    if (x) this.facing = Math.sign(x);
    this.animate(travelled > 0.0001, dt);
  }

  private animate(walking: boolean, dt: number): void {
    const key = `${this.who}:${walking ? 'walk' : 'idle'}`, sheet = this.sheets.get(key);
    if (!sheet) return;
    if (key !== this.previous) {
      this.material.map = this.depth.map = sheet.texture;
      this.material.needsUpdate = this.depth.needsUpdate = true;
      this.previous = key;
    }
    this.phase += dt * 4;
    this.frame = walking ? Math.floor(this.distance / 1.15 * sheet.frames) % sheet.frames : Math.floor(this.phase) % sheet.frames;
    sheet.texture.offset.x = this.frame / sheet.frames;
    this.body.scale.set(1.83 * sheet.aspect * this.facing, 1.83, 1);
  }

  faceCamera(camera: THREE.Camera): void {
    // Orthographic billboards share the camera direction, not its position.
    // Looking towards the camera position twisted the sprite and its shadow as it walked.
    camera.getWorldDirection(this.viewDirection);
    this.body.rotation.y = Math.atan2(-this.viewDirection.x, -this.viewDirection.z);
  }

  state(): object { return { x: this.position.x, y: this.position.y, z: this.position.z, character: this.who, animation: this.previous, frame: this.frame, castsShadow: this.body.castShadow, billboardAngle: this.body.rotation.y, contactHeight: this.position.y + this.contact.position.y }; }
}
