// Generates a pixel-art image with PixelLab (create-image-pixflux) from a description and saves
// it as a PNG. Reads the key from the PIXELLAB_API_KEY environment variable; never put a key in
// this file or in the repo.
//   node tools/pixellab-image.mjs <out.png> "<description>" [--size=128] [--seed=1] [--outline=...]
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [out, description] = args.filter((a) => !a.startsWith("--"));
const key = process.env.PIXELLAB_API_KEY;
if (!key) throw new Error("Set PIXELLAB_API_KEY first.");
const size = Number(opts.size || 128);
const body = {
  description,
  image_size: { width: size, height: Number(opts.height || size) },
  text_guidance_scale: Number(opts.guidance || 8),
  no_background: opts.transparent === "true",
};
for (const k of ["outline", "shading", "detail", "view", "direction"]) if (opts[k]) body[k] = opts[k].replaceAll("_", " ");
if (opts.seed) body.seed = Number(opts.seed);
const res = await fetch("https://api.pixellab.ai/v2/create-image-pixflux", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const json = await res.json();
if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json).slice(0, 600)}`);
const b64 = json.image?.base64 ?? json.data?.image?.base64 ?? json.images?.[0]?.base64;
if (!b64) throw new Error("no image in the reply: " + JSON.stringify(json).slice(0, 400));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ""), "base64"));
console.log("saved", out);
