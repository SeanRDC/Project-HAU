// Generates an image with OpenAI's image API from a prompt and reference images (the style
// sheet, a sprite), and saves it as a PNG. Reads the key from the OPENAI_API_KEY environment
// variable; never put a key in this file or in the repo.
//   node tools/gen-image.mjs <out.png> "<prompt>" [ref1.png ref2.png ...] [--size=1536x1024] [--model=gpt-image-1]
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [out, prompt, ...refs] = args.filter((a) => !a.startsWith("--"));
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error("Set OPENAI_API_KEY first (see the comment at the top).");
if (!out || !prompt) throw new Error("usage: node tools/gen-image.mjs <out.png> \"<prompt>\" [refs...]");

const model = opts.model || "gpt-image-1";
const size = opts.size || "1536x1024";
let res;
if (refs.length) {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", size);
  for (const ref of refs) form.append("image[]", new Blob([fs.readFileSync(ref)], { type: "image/png" }), path.basename(ref));
  res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
} else {
  res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size }),
  });
}
const json = await res.json();
if (!res.ok) throw new Error(`${res.status}: ${json.error?.message ?? JSON.stringify(json)}`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(json.data[0].b64_json, "base64"));
console.log("saved", out);
