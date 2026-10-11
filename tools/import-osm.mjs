// Pulls the campus from OpenStreetMap and writes src/game/campus/osm.ts:
// the real outline of every numbered building, the campus boundary, the
// roads and paths, and the buildings around the campus for the map.
//
//   npm run import:osm
//
// Run it again whenever someone improves HAU on openstreetmap.org. It needs
// an internet connection and nothing else.
//
// Map data (c) OpenStreetMap contributors, ODbL 1.0.
// https://www.openstreetmap.org/copyright

import { writeFileSync } from 'node:fs';

const OUT = new URL('../src/game/campus/osm.ts', import.meta.url);
/** Public Overpass servers, tried in turn. They are often busy, so it retries. */
const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const CAMPUS_RELATION = 16198709;
/** south, west, north, east: the campus and a block or so round it */
const BOX = [15.1298, 120.5872, 15.1352, 120.5928];

// --- lining OSM up with the plan ---------------------------------------------
// OSM gives latitude and longitude. The plan (src/game/campus/plan.ts) is in
// metres from the chapel, along and across the campus grid. These numbers
// turn one into the other. They were fitted on 2026-10-12 over the twelve
// buildings whose aerial-photo positions agreed with OSM to within 10 m, and
// the extra turn squares the building edges up with the grid. If you change
// GRID_TURN in plan.ts, change TURN_DEG here to match.
const LAT0 = 15.1325;
const LON0 = 120.59;
const FIT_DEG = -138.5424;
const FIT_U = -67.2658;
const FIT_V = -14.9072;
const TURN_DEG = 2.64;

const M_LAT = 110574;
const M_LON = 111320 * Math.cos((LAT0 * Math.PI) / 180);
const rot = (deg, [x, y]) => {
  const t = (deg * Math.PI) / 180;
  return [Math.cos(t) * x - Math.sin(t) * y, Math.sin(t) * x + Math.cos(t) * y];
};
function toPlan({ lat, lon }) {
  const a = rot(FIT_DEG, [(lon - LON0) * M_LON, -(lat - LAT0) * M_LAT]);
  const [u, v] = rot(TURN_DEG, [a[0] + FIT_U, a[1] + FIT_V]);
  return [Math.round(u * 10) / 10, Math.round(v * 10) / 10];
}

// --- which OSM way is which building ------------------------------------------
// Keyed by the ids in plan.ts. The OSM name is in the comment.
const BUILDINGS = {
  corazon: 836649049, // unnamed in OSM; the right size, 6 m from where the aerial photo puts the Red Bldg.
  martha: 836649052, // St. Martha Hall
  sfj: 191232597, // San Francisco Javier Bldg. (SFJ)
  stl: 191232598, // St. Therese of Lisieux Hall
  warehouse: 837726607, // Warehouse & Carpentry
  foodcourt: 191231755, // Angel Food Court
  // OSM names the first of the three halls St. Raphael and the second St. Gabriel. The 2022 campus map
  // numbers them 7 St. Gabriel, 8 St. Raphael in that order, and so does the plan. Check on site.
  sgh: 837726608, // "St. Raphael Hall" in OSM
  srh: 52432587, // "St. Gabriel Hall" in OSM
  smh: 191231206, // St. Michael Hall
  pgn: 191233593, // Peter G. Nepomuceno Bldg.
  djdn: 191237202, // Holy Angel University Main Bldg.
  aps: 837726612, // Archbishop Pedro Santos Bldg.
  mgn: 191236752, // Mamerto G. Nepomuceno Bldg.
  chapel: 191244577, // Chapel of the Holy Guardian Angel
  sjh: 285364887, // St. Joseph Hall
  sh: 191241500, // Sacred Heart Bldg
  court: 837726613, // Covered Court
  gym: 38182139, // Immaculate Heart Gymnasium
  annex: 191238837, // Gymnasium Annex
  // GGN (10) and the Formation Center (16) are not in OSM yet. They stay where the aerial photo puts them.
};

/** Old buildings OSM still shows where GGN stands now. Left off the map. */
const GONE = new Set([
  191229512, // Sta. Clara - B Bldg. (SCB)
  191229606, // Sta Clara Bldg. (SC)
  837726610, // Sta Clara Annex Bldg. (SCA)
  837726609, // Laboratory Elementary School (LES)
]);

/** Road types drawn as streets; everything else is a path. */
const STREET = new Set(['primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street']);

/** How far round the campus to keep things, in plan metres. */
const KEEP = { u0: -380, u1: 280, v0: -190, v1: 190 };

// -----------------------------------------------------------------------------

const query = `[out:json][timeout:90];
(
  way["building"](${BOX});
  way["highway"](${BOX});
  relation(${CAMPUS_RELATION});
);
out geom;`;

let data = null;
for (let attempt = 0; attempt < 3 && !data; attempt++) {
  for (const server of SERVERS) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'User-Agent': 'project-hau-student-game (tools/import-osm.mjs)', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (res.ok) {
        data = await res.json();
        break;
      }
      console.log(`  ${new URL(server).host} said ${res.status}, trying the next one`);
    } catch (e) {
      console.log(`  ${new URL(server).host} did not answer (${e.message}), trying the next one`);
    }
  }
  if (!data && attempt < 2) await new Promise((r) => setTimeout(r, 10000));
}
if (!data) {
  console.error('No OpenStreetMap server answered. Try again in a few minutes.');
  process.exit(1);
}
const ways = new Map(data.elements.filter((e) => e.type === 'way').map((e) => [e.id, e]));

const near = (pts) => pts.some(([u, v]) => u > KEEP.u0 && u < KEEP.u1 && v > KEEP.v0 && v < KEEP.v1);
const ring = (geom) => {
  const pts = geom.map(toPlan);
  // closed ways repeat the first point at the end; the painter closes them itself
  const [a, b] = [pts[0], pts[pts.length - 1]];
  if (pts.length > 1 && a[0] === b[0] && a[1] === b[1]) pts.pop();
  return pts;
};

const outlines = {};
for (const [id, wayId] of Object.entries(BUILDINGS)) {
  const w = ways.get(wayId);
  if (!w) {
    console.error(`  missing  ${id}: way ${wayId} is gone from OSM. Find its new id on openstreetmap.org.`);
    process.exitCode = 1;
    continue;
  }
  outlines[id] = ring(w.geometry);
}

const used = new Set(Object.values(BUILDINGS));
const neighbours = [];
for (const w of ways.values()) {
  if (!w.tags?.building || used.has(w.id) || GONE.has(w.id)) continue;
  const pts = ring(w.geometry);
  if (near(pts)) neighbours.push(pts);
}

const roads = [];
for (const w of ways.values()) {
  if (!w.tags?.highway) continue;
  const pts = w.geometry.map(toPlan);
  if (near(pts)) roads.push({ kind: STREET.has(w.tags.highway) ? 'street' : 'path', pts });
}

// the campus boundary: join its outer ways end to end into rings
const rel = data.elements.find((e) => e.type === 'relation' && e.id === CAMPUS_RELATION);
const pieces = (rel?.members ?? []).filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map(toPlan));
const campus = [];
const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.2;
while (pieces.length) {
  let line = pieces.shift();
  let grew = true;
  while (grew && !same(line[0], line[line.length - 1])) {
    grew = false;
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      const end = line[line.length - 1];
      if (same(end, p[0])) line = line.concat(p.slice(1));
      else if (same(end, p[p.length - 1])) line = line.concat(p.slice(0, -1).reverse());
      else continue;
      pieces.splice(i, 1);
      grew = true;
      break;
    }
  }
  campus.push(line);
}

const fmt = (pts) => `[${pts.map(([u, v]) => `[${u},${v}]`).join(',')}]`;
const out = `// Generated by tools/import-osm.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand:
// change the tool and run \`npm run import:osm\` again.
//
// Map data (c) OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright
//
// Every point is [u, v] in metres from the chapel, in the same frame as plan.ts.

export type Pt = [number, number];

/** The real outline of each numbered building, keyed like BUILDINGS in plan.ts. */
export const OUTLINES: Record<string, Pt[]> = {
${Object.entries(outlines).map(([id, pts]) => `  ${id}: ${fmt(pts)},`).join('\n')}
};

/** The campus boundary, one ring per piece of ground. */
export const CAMPUS: Pt[][] = [
${campus.map((r) => `  ${fmt(r)},`).join('\n')}
];

/** Streets round the campus and paths through it. */
export const ROADS: { kind: 'street' | 'path'; pts: Pt[] }[] = [
${roads.map((r) => `  { kind: '${r.kind}', pts: ${fmt(r.pts)} },`).join('\n')}
];

/** Every other building nearby, for the map. */
export const NEIGHBOURS: Pt[][] = [
${neighbours.map((r) => `  ${fmt(r)},`).join('\n')}
];
`;
writeFileSync(OUT, out);
console.log(
  `wrote src/game/campus/osm.ts: ${Object.keys(outlines).length} campus buildings, ${neighbours.length} neighbours, ` +
    `${roads.length} roads and paths, ${campus.length} boundary ring(s)`,
);
