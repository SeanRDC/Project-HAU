// The side gate by the Main Building, the one students come in by. You start
// out on the street on the right, with the traffic going by between you and
// the camera, pass a pickup parked where it shouldn't be and the enforcer
// ticketing it, and walk in under the gatehouse: the bag tables and the two
// ID turnstiles stand under its roof. Tap your ID and you walk in through
// the gate, away from the camera, and come out up the walkway onto the flag
// plaza inside (scenes/entry.ts).

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { css, damp, hex, rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect } from '../../engine/pix';
import {
  ARCH_WIDTH, BARRICADE_W, PIER_W, ReaderState, bagOnTable, bagTable, barricade, gateHouse, gatePiers, idCard,
  inspectionSign, noIdBoard, noParkingSign, perimeterWall, railing, readerScreen, turnstile, turnstileArm,
} from '../art/gate';
import { P, shade } from '../art/palette';
import { baseLook } from '../art/player';
import { SILHOUETTE, boomBarrier, bush, foliage, hedge, lampPost, palm, pot, tree } from '../art/props';
import { Sprite, VehicleKind, drawVehicle, lampAt, vehicleSprite } from '../art/traffic';
import { Checkpoint, comeOut, gateArrival, gateHotspots, gateNpcs, ownerWaiting } from '../story/gate';
import { AreaDef, AreaLight, Layer } from '../types';

const WIDTH = 1200;
// this scene sits higher on the screen than the others: the street needs the room below the sidewalk
const GROUND = 188;
const WALK = 224;
/** the line the gate furniture stands on, just behind where people walk */
const BACK = WALK - 6;

const BOOM_X = 56;
/** the gatehouse: its front piers stand at the kerb, just nearer the camera than the line people walk on */
const ARCH_X = 600;
const GATE_BASE = WALK + 2;
/** the whole checkpoint is under its roof: the turnstile by the inner pier, then the two bag tables */
const TURNSTILE_X = ARCH_X - ARCH_WIDTH / 2 + PIER_W + 20;
/** the way in: between the gate leaves folded back at the far end of the gatehouse, a little left of the middle */
const DOOR_X = ARCH_X - 30;
/** where you stand after walking back out of the gate */
const OUT_X = TURNSTILE_X + 36;
const TABLE_A = ARCH_X - 10;
const TABLE_B = ARCH_X + 60;
const SIGN_X = ARCH_X + ARCH_WIDTH / 2 + 22;
/** the NO ID, NO ENTRY board hangs on the fence just past the gatehouse */
const BOARD_X = SIGN_X + 56;
/** the pickup parked up on the sidewalk, the sign it is parked beside, and where the enforcer stands writing it up */
const TRUCK_X = 912;
const TRUCK_BASE = GROUND + 27;
const TRUCK_SCALE = 1.5;
const NO_PARKING_X = 846;
const ENFORCER_X = 830;
const STREET_X = 1180;
/** where the campus drive ends and the public sidewalk and street begin; a big tree stands in front of the join */
const KERB_X = 450;
/** the two lanes of the street: where the wheels run, how big the vehicles are drawn, which way they go */
const LANES = [
  { base: VIEW_H - 19, scale: 1.4, dir: -1 as const, speed: 84, every: 3.4 },
  // the near lane is a little bigger and quicker, and still whole on the screen
  { base: VIEW_H - 2, scale: 1.7, dir: 1 as const, speed: 122, every: 4.6 },
];

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** Rooftops of the city and the tree line far behind the wall. */
function farLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.16), VIEW_H);
  const rand = rng(61);
  for (let x = -10; x < canvas.width; x += 26 + rand() * 30) {
    const h = 16 + rand() * 30;
    rect(c, x, GROUND - h, 32, h, rand() > 0.5 ? '#b9a48f' : '#a7a2a8');
    poly(c, [[x - 3, GROUND - h], [x + 35, GROUND - h], [x + 16, GROUND - h - 9]], rand() > 0.4 ? '#a0584a' : '#6f7d8c');
  }
  // a water tower on stilts, the kind every barangay has
  const wx = 300;
  for (const dx of [-8, 8]) line(c, wx + dx, GROUND - 20, wx + dx * 0.6, GROUND - 62, '#7d808a', 1);
  rect(c, wx - 12, GROUND - 82, 24, 20, '#9aa3ae');
  rect(c, wx - 12, GROUND - 82, 6, 20, '#b4bcc6');
  poly(c, [[wx - 14, GROUND - 82], [wx + 14, GROUND - 82], [wx, GROUND - 92]], '#7d8794');
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 14, 14 + rand() * 10, 10 + rand() * 8, 620 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return canvas;
}

/** Campus buildings rising over the wall on the inside, shophouses on the street side. */
function midLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.42), VIEW_H);
  const rand = rng(97);
  const archAt = ARCH_X * 0.42;

  // banded high-rise, same build as the ones behind the DJN
  const tower = (x: number, top: number, w: number, floors: number, glass = ['#6b8fc4', '#8fb1dc']) => {
    const fh = Math.floor((GROUND - top) / floors);
    rect(c, x, top, w, GROUND - top, '#70747e');
    for (let f = 0; f < floors; f++) {
      const y = top + f * fh;
      rect(c, x - 3, y, w + 6, 5, '#ecebe6');
      rect(c, x - 3, y + 5, w + 6, 1, '#b9b8b6');
      rect(c, x, y + 6, w, fh - 6, '#565c6c');
      for (let wx = x + 3; wx < x + w - 6; wx += 9) rect(c, wx, y + 8, 6, fh - 10, rand() > 0.25 ? glass[0] : glass[1]);
    }
    rect(c, x + w - 10, top, 13, GROUND - top, '#5a5e68');
  };
  tower(40, 60, 130, 8);
  // the green glass of SFJ over the fence to the left of the gatehouse, a banded block to the right
  tower(archAt - 150, 84, 104, 6, ['#35a394', '#6fcdbc']);
  tower(archAt + 96, 96, 150, 6, ['#55617a', '#6f7d98']);

  // two-storey shophouses across the side street
  for (let x = archAt + 270; x < canvas.width; x += 70) {
    const h = 50 + rand() * 20;
    rect(c, x, GROUND - h, 64, h, rand() > 0.5 ? '#d8c9a2' : '#c9b8a8');
    rect(c, x, GROUND - h, 64, 3, '#efe6d2');
    for (let wx = x + 6; wx < x + 58; wx += 14) rect(c, wx, GROUND - h + 10, 9, 10, '#4c5568');
    rect(c, x + 4, GROUND - 26, 56, 4, rand() > 0.5 ? '#3d6a8a' : P.maroon); // awning
    rect(c, x + 6, GROUND - 22, 52, 22, '#5a5462');
  }
  for (let x = -10; x < archAt + 250; x += 44 + rand() * 50) tree(c, x, GROUND + 2, 50 + rand() * 30, 18 + rand() * 10, 960 + Math.round(x));
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return canvas;
}

function ground(c: Ctx): void {
  const rand = rng(8);
  const inside = KERB_X;
  // inside: sidewalk then the pebble-wash driveway, like the DJN drive
  rect(c, 0, GROUND, inside, 14, P.pave);
  rect(c, 0, GROUND, inside, 1, shade(P.pave, 0.35));
  for (let x = 0; x < inside; x += 14) rect(c, x, GROUND + 1, 1, 12, P.paveLine);
  rect(c, 0, GROUND + 7, inside, 1, P.paveLine);
  rect(c, 0, GROUND + 14, inside, 2, shade(P.pave, 0.3));
  rect(c, 0, GROUND + 16, inside, 2, P.paveDark);
  rect(c, 0, GROUND + 18, inside, VIEW_H - GROUND - 18, P.road);
  rect(c, 0, GROUND + 18, inside, 10, shade(P.road, 0.14));
  rect(c, 0, GROUND + 52, inside, 20, shade(P.road, -0.12));
  for (let i = 0; i < 1800; i++) {
    px(c, rand() * inside, GROUND + 18 + rand() * (VIEW_H - GROUND - 18), rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  for (let x = 40; x < inside; x += 120) line(c, x, GROUND + 18, x - 26, VIEW_H, P.roadDark, 1);
  // outside: the public sidewalk, the kerb, then the concrete of Sto. Rosario St.
  const w = WIDTH - inside;
  rect(c, inside, GROUND, w, 40, '#b3ab9c');
  rect(c, inside, GROUND, w, 1, shade('#b3ab9c', 0.35));
  for (let x = inside; x < WIDTH; x += 18) rect(c, x, GROUND + 1, 1, 39, '#9c9487');
  for (let y = GROUND + 10; y < GROUND + 40; y += 10) rect(c, inside, y, w, 1, '#9c9487');
  rect(c, inside, GROUND + 40, w, 2, P.stoneHi);
  rect(c, inside, GROUND + 42, w, 2, P.stoneDark);
  const street = '#8b8a8f';
  rect(c, inside, GROUND + 44, w, VIEW_H - GROUND - 44, street);
  rect(c, inside, GROUND + 44, w, 4, shade(street, 0.12));
  rect(c, inside, GROUND + 56, w, 8, shade(street, -0.1));
  for (let i = 0; i < 700; i++) px(c, inside + rand() * w, GROUND + 45 + rand() * 19, rand() > 0.5 ? shade(street, 0.2) : shade(street, -0.2));
  // the joints between the slabs, and the worn line down the middle
  for (let x = inside + 30; x < WIDTH; x += 64) line(c, x, GROUND + 44, x - 8, VIEW_H, shade(street, -0.25), 1);
  for (let x = inside + 10; x < WIDTH; x += 30) rect(c, x, GROUND + 55, 16, 1, '#dcd8c8');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lampColor = hex(P.lamp);

  tree(c, 120, GROUND + 2, 110, 40, 401);
  tree(c, 860, GROUND + 2, 96, 34, 402);
  palm(c, 250, GROUND + 2, 80, 410);
  // the palms and trees that stand inside the fence, behind the gatehouse
  palm(c, ARCH_X - 152, GROUND + 2, 118, 411);
  palm(c, ARCH_X + 150, GROUND + 2, 130, 412);
  palm(c, ARCH_X + 176, GROUND + 2, 104, 413);
  tree(c, ARCH_X + 400, GROUND + 2, 92, 38, 403);
  tree(c, ARCH_X + 520, GROUND + 2, 104, 40, 404);

  // the wall runs the whole way, broken by the gate
  perimeterWall(c, 0, ARCH_X - ARCH_WIDTH / 2, GROUND);
  perimeterWall(c, ARCH_X + ARCH_WIDTH / 2, WIDTH, GROUND);
  // a clipped hedge behind the railings on the street side
  hedge(c, ARCH_X + ARCH_WIDTH / 2 + 16, GROUND - 9, 150, 12, 31);
  ground(c);
  gateHouse(c, ARCH_X, GATE_BASE, GROUND);
  // the spotlights on the beam, and the strip lights under the roof that light the checkpoint
  for (const dx of [-ARCH_WIDTH / 2 + 7, ARCH_WIDTH / 2 - 6]) {
    disc(g, ARCH_X + dx, GATE_BASE - 112, 3, P.lamp);
    lights.push({ x: ARCH_X + dx, y: GATE_BASE - 98, r: 76, color: lampColor, strength: 0.85 });
  }
  for (const dx of [-44, 44]) {
    rect(g, ARCH_X + dx - 6, GATE_BASE - 70, 12, 2, '#fff1c8');
    lights.push({ x: ARCH_X + dx, y: BACK - 40, r: 86, color: [255, 236, 190], strength: 0.85 });
  }

  // inside: planting along the wall, the barrier by Gate 1, the warning board
  hedge(c, 80, GROUND + 3, 200, 11, 21);
  for (let i = 0; i < 4; i++) bush(c, 96 + i * 50, GROUND + 1, 26, 16, 30 + i);
  pot(c, 300, GROUND + 6, 23);
  pot(c, 330, GROUND + 6, 24);
  boomBarrier(c, BOOM_X, GROUND + 22, 84, 2.05);
  noIdBoard(c, BOARD_X - 23, GROUND - 36);

  // the checkpoint, under the gatehouse roof
  // two turnstiles side by side: the far lane is drawn first, a little up the screen
  turnstile(c, TURNSTILE_X - 9, BACK - 13);
  turnstileArm(c, TURNSTILE_X - 9, BACK - 13, 0);
  readerScreen(c, TURNSTILE_X - 9, BACK - 13, 'idle', 0);
  railing(c, TURNSTILE_X + 9, TURNSTILE_X + 33, BACK - 13);
  railing(c, TURNSTILE_X + 18, TURNSTILE_X + 42, BACK);
  turnstile(c, TURNSTILE_X, BACK);
  bagTable(c, TABLE_A, BACK);
  bagTable(c, TABLE_B, BACK);
  inspectionSign(c, SIGN_X, BACK);
  // out on the street: the pickup up on the sidewalk, nose to the NO PARKING sign, a ticket under its wiper
  noParkingSign(c, NO_PARKING_X, GROUND + 8);
  const pickup = vehicleSprite('pickup', '#d8281f');
  ellipse(c, TRUCK_X, TRUCK_BASE, 54, 3, 'rgba(20,14,34,0.3)');
  drawVehicle(c, pickup, TRUCK_X, TRUCK_BASE, TRUCK_SCALE, -1);
  rect(c, TRUCK_X - 16, TRUCK_BASE - 34, 5, 3, '#f4f1ea');
  rect(c, TRUCK_X - 16, TRUCK_BASE - 34, 5, 1, '#c9c4b8');

  for (const x of [170, 330, 790, 1020, 1160]) {
    const l = lampPost(c, x, GROUND + 15);
    lights.push({ x: l.x, y: l.y, r: 92, color: lampColor, strength: 0.95 });
    disc(g, l.x, l.y, 4, P.lamp);
    lights.push({ x: l.x, y: GROUND + 24, r: 60, color: lampColor, strength: 0.5 });
  }
  // the reader's screen lights the turnstile a little, day and night
  lights.push({ x: TURNSTILE_X + 5, y: BACK - 22, r: 22, color: [140, 190, 255], strength: 0.35, always: true });
  return { canvas, glow };
}

/** Out-of-focus plants close to the camera. Only branches on the street side: the road is kept clear for the traffic. */
function frontLayer(): HTMLCanvasElement {
  const parallax = 1.35;
  const [canvas, c] = makeCanvas(layerWidth(parallax), VIEW_H);
  const rand = rng(99);
  for (let x = 80; x < canvas.width; x += 280 + rand() * 200) {
    // the world x this part of the layer is in front of when it is mid-screen
    const world = VIEW_W / 2 + (x - VIEW_W / 2) / parallax;
    if (rand() < 0.6 && world < KERB_X - 120) bush(c, x, VIEW_H + 34, 120 + rand() * 60, 50 + rand() * 12, 800 + x, SILHOUETTE);
    else {
      foliage(c, x, -8, 84, 22, 840 + x, SILHOUETTE);
      foliage(c, x + 56, -2, 44, 14, 841 + x, SILHOUETTE);
    }
  }
  return canvas;
}

/**
 * What stands at the kerb, between the people and the traffic: the two front
 * piers of the gatehouse, and the row of barricades along the street beyond it.
 */
function kerbRow(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  gatePiers(c, ARCH_X, GATE_BASE);
  for (let x = ARCH_X + ARCH_WIDTH / 2 + 10; x < WIDTH - 20; x += BARRICADE_W + 3) barricade(c, x, GROUND + 46);
  return canvas;
}

/**
 * The trunk of a big old tree between the street and the camera, where the
 * campus drive meets the sidewalk, as in the photo. Drawn over the traffic
 * and the people.
 */
function trunkLayer(): Layer {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(77);
  // the trunk: mottled bark, lighter where the sun catches its left side
  const bark = '#6b5d4c';
  const tx = KERB_X - 24;
  const tw = 50;
  poly(c, [[tx - 6, VIEW_H], [tx + 4, 150], [tx + 2, 0], [tx + tw - 2, 0], [tx + tw - 6, 150], [tx + tw + 8, VIEW_H]], bark);
  poly(c, [[tx - 6, VIEW_H], [tx + 4, 150], [tx + 2, 0], [tx + 14, 0], [tx + 15, 150], [tx + 8, VIEW_H]], shade(bark, 0.16));
  poly(c, [[tx + tw - 14, VIEW_H], [tx + tw - 14, 0], [tx + tw - 2, 0], [tx + tw - 6, 150], [tx + tw + 8, VIEW_H]], shade(bark, -0.3));
  for (let i = 0; i < 46; i++) {
    const bx = tx + 3 + rand() * (tw - 10);
    const by = rand() * VIEW_H;
    const r = rand();
    rect(c, bx, by, 3 + rand() * 7, 2 + rand() * 6, r > 0.6 ? '#c9b06a' : r > 0.3 ? shade(bark, -0.35) : shade(bark, 0.25));
  }
  // and a bough of its leaves across the top of the frame
  foliage(c, tx + 80, -6, 92, 20, 771, SILHOUETTE);
  foliage(c, tx - 30, -10, 60, 16, 772, SILHOUETTE);
  return { canvas, parallax: 1, front: true };
}

interface Vehicle {
  sprite: Sprite;
  lane: number;
  x: number;
  speed: number;
}

/** the jeepneys on this route are purple or green */
const FLEET: [VehicleKind, string][] = [
  ['jeepney', '#6d3fa8'], ['car', '#c9cdd3'], ['jeepney', '#2f8f4e'], ['tricycle', '#2f5f9e'], ['suv', '#e2dccb'],
  ['jeepney', '#8a55c8'], ['car', '#3b4a66'], ['jeepney', '#3aa35c'], ['tricycle', '#c8342f'], ['suv', '#2a2c36'],
];

/** Live state of the checkpoint props, worked by the cutscenes in story/gate.ts. */
interface Props {
  arm: number;
  /** a cutscene is holding the arm down */
  held: boolean;
  /** the player has scanned in, so the arm drops whenever they walk up */
  unlocked: boolean;
  reader: ReaderState;
  readerTime: number;
  card: boolean;
  bag: 'none' | 'closed' | 'open';
  flashlight: boolean;
}

export function buildGate(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(4321);
  const st: Props = {
    arm: 0, held: false, unlocked: false, reader: 'idle', readerTime: 0, card: false, bag: 'none', flashlight: false,
  };
  const cp: Checkpoint = {
    scanner: TURNSTILE_X + 16,
    door: DOOR_X,
    // up to just short of the back edge of the gatehouse floor, so their feet stay on the paving
    doorRise: WALK - GROUND - 3,
    tableA: TABLE_A,
    tableB: TABLE_B,
    pickup: ENFORCER_X + 46,
    owner: TRUCK_X + 22,
    bag: (s) => (st.bag = s),
    reader: (s) => {
      st.reader = s;
      st.readerTime = 1.6;
    },
    card: (show) => (st.card = show),
    hold: (open) => (st.held = open),
    flashlight: (on) => (st.flashlight = on),
    unlock: () => (st.unlocked = true),
  };
  let leafTimer = 0;
  let playerX = 0;

  // the traffic on the street: a few vehicles already on the road, then one along every few seconds in each lane
  const kerb = kerbRow();
  const sprites = FLEET.map(([kind, body]) => vehicleSprite(kind, body));
  const traffic: Vehicle[] = [];
  const due = LANES.map((_, i) => 0.6 + i * 1.7);
  let pick = 0;
  const send = (lane: number, x?: number) => {
    const l = LANES[lane];
    const sprite = sprites[pick++ % sprites.length];
    const off = (sprite.canvas.width * l.scale) / 2 + 6;
    traffic.push({ sprite, lane, x: x ?? (l.dir > 0 ? KERB_X - off : WIDTH + off), speed: l.speed * (0.85 + rand() * 0.3) });
  };
  send(0, KERB_X + 240);
  send(1, KERB_X + 520);
  /** vehicles are only seen on the street: they pass behind the big tree and are gone */
  const onStreet = (ctx: Ctx, cam: number, draw: () => void) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(KERB_X - cam, 0, WIDTH, VIEW_H);
    ctx.clip();
    draw();
    ctx.restore();
  };

  return {
    id: 'gate',
    title: 'Side Gate',
    subtitle: 'Sa tabi ng Main Building',
    subtitleEn: 'Beside the Main Building',
    width: WIDTH,
    walkY: WALK,
    // the turnstiles are as far in as you can walk: from there you go in through the gate
    bounds: [TURNSTILE_X + 4, WIDTH - 16],
    outdoor: true,
    layers: [
      { canvas: farLayer(), parallax: 0.16, haze: 0.62 },
      { canvas: midLayer(), parallax: 0.42, haze: 0.34 },
      { canvas: main.canvas, parallax: 1 },
      trunkLayer(),
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: gateHotspots({ street: STREET_X, arch: SIGN_X - 8, board: BOARD_X, pickup: TRUCK_X }, cp),
    npcs: gateNpcs({
      joy: TABLE_A - 26, nonoy: TABLE_B - 26, enforcer: ENFORCER_X, taho: [1080, 1160], owner: TRUCK_X + 22, away: WIDTH + 260,
    }),
    spawns: {
      street: { x: TRUCK_X + 150, facing: -1 },
      // coming back out down the entryway walk: just this side of the turnstiles
      entry: { x: OUT_X, facing: 1 },
    },
    barrier: { x: TURNSTILE_X + 12, until: 'scanned_id' },

    intro(game, x) {
      // props back to rest, whatever a previous visit left them in
      Object.assign(st, { held: false, card: false, bag: 'none', flashlight: false, reader: 'idle' });
      st.unlocked = game.has('scanned_id');
      if (!game.has('passed_bag_check')) return gateArrival(cp, game.hour());
      const steps = x === OUT_X ? comeOut(cp) : [];
      // the pickup's owner has turned up by now and is still standing by it
      if (game.has('saw_ticket')) steps.unshift(...ownerWaiting(cp));
      return steps.length ? steps : null;
    },

    update(dt, area) {
      playerX = area.playerX();
      const near = Math.abs(playerX - (TURNSTILE_X + 10)) < 24;
      st.arm = damp(st.arm, st.held || (st.unlocked && near) ? 1 : 0, 9, dt);
      if (st.reader !== 'idle' && (st.readerTime -= dt) <= 0) st.reader = 'idle';

      for (let i = traffic.length - 1; i >= 0; i--) {
        const v = traffic[i];
        const l = LANES[v.lane];
        v.x += l.dir * v.speed * dt;
        const off = (v.sprite.canvas.width * l.scale) / 2 + 8;
        if (v.x < KERB_X - off || v.x > WIDTH + off) traffic.splice(i, 1);
      }
      LANES.forEach((_, i) => {
        if ((due[i] -= dt) <= 0) {
          due[i] = LANES[i].every * (0.7 + rand() * 0.9);
          send(i);
        }
      });

      leafTimer -= dt;
      if (leafTimer <= 0) {
        leafTimer = 0.8 + rand() * 1.4;
        const from = [120, 860][Math.floor(rand() * 2)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 60,
          y: GROUND - 80 + rand() * 30,
          vx: 6 + rand() * 8,
          vy: 9 + rand() * 6,
          sway: 16,
          max: 9,
          floor: GROUND + 16 + rand() * 40,
          color: rand() > 0.5 ? '#c9a23e' : '#8fbf58',
        });
      }
    },

    drawBack(ctx, view) {
      const cam = Math.round(view.camX);
      const top = BACK - 15;
      if (st.bag !== 'none') bagOnTable(ctx, TABLE_B + 6 - cam, top, baseLook().bag!, st.bag === 'open');
    },

    drawFront(ctx, view) {
      const cam = Math.round(view.camX);
      turnstileArm(ctx, TURNSTILE_X - cam, BACK, st.arm);
      if (st.card) idCard(ctx, TURNSTILE_X + 10 - cam, BACK - 27);
      // from the fence towards the camera: the gatehouse piers and the barricades at the kerb,
      // then the far lane and the near lane
      ctx.drawImage(kerb, -cam, 0);
      onStreet(ctx, cam, () => {
        for (const lane of LANES.keys()) {
          const l = LANES[lane];
          for (const v of traffic) {
            if (v.lane !== lane) continue;
            // a little bounce over the joints in the concrete
            const bump = Math.sin(view.time * 11 + v.x * 0.09) > 0.93 ? 1 : 0;
            drawVehicle(ctx, v.sprite, v.x - cam, l.base - bump, l.scale, l.dir);
          }
        }
      });
    },

    drawOver(ctx, view) {
      const cam = Math.round(view.camX);
      if (view.mood.night > 0.3) {
        // headlights: a bright point and a short beam on the road ahead
        onStreet(ctx, cam, () => {
          ctx.globalCompositeOperation = 'lighter';
          for (const v of traffic) {
            const l = LANES[v.lane];
            const [hx, hy] = lampAt(v.sprite, v.x - cam, l.base, l.scale, l.dir);
            const reach = 46 * l.scale;
            const grad = ctx.createLinearGradient(hx, 0, hx + l.dir * reach, 0);
            grad.addColorStop(0, css([255, 240, 190], 0.5 * view.mood.night));
            grad.addColorStop(1, css([255, 240, 190], 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(hx, hy - 1);
            ctx.lineTo(hx + l.dir * reach, hy - 5 * l.scale);
            ctx.lineTo(hx + l.dir * reach, l.base + 2);
            ctx.lineTo(hx, hy + 2);
            ctx.fill();
            ctx.globalAlpha = view.mood.night;
            disc(ctx, hx, hy, 2 * l.scale, '#fff6d0');
            ctx.globalAlpha = 1;
          }
          ctx.globalCompositeOperation = 'source-over';
        });
      }
      readerScreen(ctx, TURNSTILE_X - cam, BACK, st.reader, view.time);
      if (st.reader !== 'idle') {
        const x = TURNSTILE_X + 5 - cam;
        const glowCol = st.reader === 'ok' ? [75, 220, 120] : [255, 74, 74];
        const grad = ctx.createRadialGradient(x, BACK - 22, 0, x, BACK - 22, 26);
        grad.addColorStop(0, css(glowCol as [number, number, number], 0.45));
        grad.addColorStop(1, css(glowCol as [number, number, number], 0));
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(x - 26, BACK - 48, 52, 52);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (st.flashlight) {
        // the guard's flashlight poking around inside the bag
        const hx = TABLE_B - 20 - cam;
        const hy = BACK - 20;
        const bx = TABLE_B + 6 - cam + Math.sin(view.time * 5) * 3;
        const by = BACK - 27;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.28;
        poly(ctx, [[hx, hy], [bx - 6, by - 2], [bx + 6, by + 4]], '#fff4c8');
        ctx.globalAlpha = 0.5;
        disc(ctx, bx, by + 1, 3, '#fff4c8');
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    },
  };
}
