import { build } from "esbuild";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { runInNewContext } from "node:vm";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { configSignature, normalizeSettings } from "../src/settings.js";

const aliases = {
  "react-dom/client": "preact/compat/client",
  "react-dom": "preact/compat",
  react: "preact/compat",
};
// This owner-controlled public file is the same configuration loaded by the
// browser. Evaluate it without process/require/network or browser globals.
const configContext = { window: {} };
runInNewContext(await readFile("public/site.config.js", "utf8"), configContext, {
  timeout: 1000,
  contextCodeGeneration: { strings: false, wasm: false },
});
const settings = normalizeSettings(configContext.window.VINICOLA_CONFIG);
const serverBuild = await build({
  entryPoints: ["src/prerender.jsx"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node24"],
  alias: aliases,
  write: false,
});
const serverModule = await import(
  `data:text/javascript;base64,${Buffer.from(serverBuild.outputFiles[0].contents).toString("base64")}`
);
const markup = serverModule.prerender(settings);
const attribute = (value) => value.replace(/[&"<>]/g, (character) => ({
  "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;",
})[character]);
await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await cp("public", "dist", { recursive: true });
const fontSource = "noto-sans-kr-subset.woff2";
const fontBytes = await readFile(`public/assets/${fontSource}`);
const fontName = `noto-sans-kr-${createHash("sha256").update(fontBytes).digest("hex").slice(0, 12)}.woff2`;
await writeFile(`dist/assets/${fontName}`, fontBytes);
await rm(`dist/assets/${fontSource}`);
const result = await build({
  entryPoints: ["src/client.jsx"],
  bundle: true,
  alias: aliases,
  minify: true,
  format: "esm",
  target: ["es2022"],
  external: [`./${fontName}`],
  plugins: [{
    name: "versioned-local-font",
    setup(context) {
      context.onLoad({ filter: /styles\.css$/ }, async (args) => ({
        contents: (await readFile(args.path, "utf8")).replaceAll(fontSource, fontName),
        loader: "css",
        resolveDir: dirname(args.path),
      }));
    },
  }],
  outdir: "dist/assets",
  entryNames: "app-[hash]",
  metafile: true,
  logLevel: "info",
});
const outputs = Object.keys(result.metafile.outputs);
const js = outputs.find((p) => p.endsWith(".js"));
const css = outputs.find((p) => p.endsWith(".css"));
const template = (await readFile("index.html", "utf8"))
  .replaceAll(fontSource, fontName)
  .replace("<!-- APP_CONFIG_SIGNATURE -->", attribute(configSignature(settings)))
  .replace("<!-- APP_HTML -->", markup);
await writeFile(
  "dist/index.html",
  template
    .replace(
      "<!-- APP_CSS -->",
      `<link rel="stylesheet" href="./${css.replace(/^dist\//, "")}">`,
    )
    .replace(
      "<!-- APP_SCRIPT -->",
      `<script type="module" src="./${js.replace(/^dist\//, "")}"></script>`,
    ),
);
