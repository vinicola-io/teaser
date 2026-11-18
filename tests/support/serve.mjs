import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

// Test GitHub project Pages paths without changing the production preview server.
const root = resolve("dist");
const mount = "/teaser/";
const port = Number(process.env.PW_TEST_PORT || 4187);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };
const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); return response.end(); }
    const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!path.startsWith(mount)) { response.writeHead(404); return response.end("Not found"); }
    const file = resolve(root, path.slice(mount.length) || "index.html");
    if (!file.startsWith(root + sep)) { response.writeHead(403); return response.end(); }
    if (!(await stat(file)).isFile()) throw new Error("Not a file");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Content-Length": body.length, "Cache-Control": "no-store" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch { response.writeHead(404); response.end("Not found"); }
});
server.listen(port, "127.0.0.1", () => console.log(`UI fixture: http://127.0.0.1:${port}${mount}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
