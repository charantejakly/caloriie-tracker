import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, normalize } from "node:path";

const base = resolve(process.cwd(), process.argv[2] || ".");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = resolve(base, normalize(relative));
  if (!file.startsWith(base)) { response.writeHead(403).end(); return; }
  try { const info = await stat(file); const actual = info.isDirectory() ? resolve(file, "index.html") : file; response.writeHead(200, { "Content-Type": mime[extname(actual)] || "application/octet-stream", "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0" }); response.end(await readFile(actual)); }
  catch { response.writeHead(404).end("Not found"); }
});
const port = 5173;
server.listen(port, "0.0.0.0", () => {
  console.log(`LEAN MODE is running locally at http://localhost:${port}`);
  console.log(`To open on your phone (same Wi-Fi), visit http://<your-laptop-ip>:${port}`);
});
