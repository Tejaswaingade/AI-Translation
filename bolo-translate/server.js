// Tiny local dev server (no dependencies). Run: npm run dev  ->  http://localhost:3000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, "public");

function loadEnv() {
  const envFiles = [path.join(__dirname, ".env"), path.join(__dirname, "..", ".env")];
  for (const ef of envFiles) {
    try {
      if (fs.existsSync(ef)) {
        for (const line of fs.readFileSync(ef, "utf8").split(/\r?\n/)) {
          const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
          if (m && m[1]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
        }
      }
    } catch {}
  }
}
loadEnv();

const { default: handler } = await import("./api/translate.js");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/translate") {
    let raw = "";
    for await (const c of req) raw += c;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
    if (!process.env.GEMINI_API_KEY) loadEnv();
    return handler(req, res);
  }
  const file = path.join(PUB, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!file.startsWith(PUB)) { res.statusCode = 403; return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () =>
  console.log(`\nBolo running at http://localhost:${process.env.PORT || 3000}\n` +
    (process.env.GEMINI_API_KEY ? "Gemini key: found ✓" : "Gemini key: MISSING (create .env with GEMINI_API_KEY=...)")));
