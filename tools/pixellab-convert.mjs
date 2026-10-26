// Converts a picture into true pixel art with PixelLab Pro (image-to-pixelart-pro): it finds the
// picture's own pixel scale, shrinks it to that grid and cleans it, without redrawing it. With
// --size it uses image-to-pixelart instead, at that output size, in faithful mode starting from the
// picture (--strength, 100-300 useful). Reads the key from the PIXELLAB_API_KEY environment
// variable; never put a key in this file or the repo.
//   node tools/pixellab-convert.mjs <in.png> <out.png> ["<style notes>"] [--colors=32] [--seed=1]
//   node tools/pixellab-convert.mjs <in.png> <out.png> --size=256x384 [--strength=200]
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split(/=(.*)/s)));
const [inp, out, description] = args.filter((a) => !a.startsWith("--"));
const key = process.env.PIXELLAB_API_KEY;
if (!key) throw new Error("Set PIXELLAB_API_KEY first.");
const api = "https://api.pixellab.ai/v2";
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const buf = fs.readFileSync(inp);
const body = { image: { type: "base64", base64: buf.toString("base64"), format: "png" } };
const sized = Boolean(opts.size);
if (sized) {
  const [w, h] = opts.size.split("x").map(Number);
  body.image_size = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  body.output_size = { width: w, height: h };
  body.fixer = true;
  body.init_image_strength = Number(opts.strength || 200);
} else {
  if (description) body.description = description;
  if (opts.colors) body.target_palette = { max_colors: Number(opts.colors) };
}
if (opts.seed) body.seed = Number(opts.seed);

const save = (img) => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(String(img.base64).replace(/^data:image\/\w+;base64,/, ""), "base64"));
  console.log("saved", out);
  process.exit(0);
};
const start = await fetch(`${api}/${sized ? "image-to-pixelart" : "image-to-pixelart-pro"}`, { method: "POST", headers, body: JSON.stringify(body) });
const job = await start.json();
if (!start.ok) throw new Error(`${start.status}: ${JSON.stringify(job).slice(0, 600)}`);
// the sized tool may answer at once
if (job.image ?? job.data?.image) save(job.image ?? job.data.image);
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const s = await (await fetch(`${api}/background-jobs/${job.background_job_id}`, { headers })).json();
  if (s.status === "completed") {
    const r = s.last_response ?? s.result ?? s;
    const img = r.image ?? r.images?.[0];
    if (!img) throw new Error("no image in the reply: " + JSON.stringify(s).slice(0, 500));
    save(img);
  }
  if (s.status === "failed") throw new Error("failed: " + JSON.stringify(s).slice(0, 500));
}
throw new Error("timed out waiting for the job");
