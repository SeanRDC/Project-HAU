// Generates a pixel-art image with PixelLab Pro (generate-image-v2) in the style of a style
// image, optionally guided by subject reference images, and saves it as a PNG. Reads the key
// from the PIXELLAB_API_KEY environment variable; never put a key in this file or the repo.
//   node tools/pixellab-styled.mjs <out.png> "<description>" --style=<style.png> [--ref=<a.png>,<b.png>] [--width=128] [--height=128] [--seed=1]
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split(/=(.*)/s)));
const [out, description] = args.filter((a) => !a.startsWith("--"));
const key = process.env.PIXELLAB_API_KEY;
if (!key) throw new Error("Set PIXELLAB_API_KEY first.");
const api = "https://api.pixellab.ai/v2";
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

// a PNG's width and height, read from its header
const pngSize = (buf) => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) });
const image = (file, usage) => {
  const buf = fs.readFileSync(file);
  return { image: { type: "base64", base64: buf.toString("base64"), format: "png" }, size: pngSize(buf), ...(usage ? { usage_description: usage } : {}) };
};

const body = {
  description,
  image_size: { width: Number(opts.width || 128), height: Number(opts.height || opts.width || 128) },
};
if (opts.style) {
  body.style_image = image(opts.style);
  body.style_options = { color_palette: true, outline: true, detail: true, shading: true };
}
if (opts.ref) body.reference_images = opts.ref.split(",").map((f) => image(f, "the character's design"));
if (opts.seed) body.seed = Number(opts.seed);

const start = await fetch(`${api}/generate-image-v2`, { method: "POST", headers, body: JSON.stringify(body) });
const job = await start.json();
if (!start.ok) throw new Error(`${start.status}: ${JSON.stringify(job).slice(0, 600)}`);
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const s = await (await fetch(`${api}/background-jobs/${job.background_job_id}`, { headers })).json();
  if (s.status === "completed") {
    const r = s.last_response ?? s.result ?? s;
    const imgs = r.images ?? (r.image ? [r.image] : []);
    if (!imgs.length) throw new Error("no image in the reply: " + JSON.stringify(s).slice(0, 500));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    imgs.forEach((img, n) => {
      const file = n ? out.replace(/\.png$/, `-${n}.png`) : out;
      fs.writeFileSync(file, Buffer.from(String(img.base64).replace(/^data:image\/\w+;base64,/, ""), "base64"));
      console.log("saved", file);
    });
    process.exit(0);
  }
  if (s.status === "failed") throw new Error("failed: " + JSON.stringify(s).slice(0, 500));
}
throw new Error("timed out waiting for the job");
