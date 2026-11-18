import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await cp("public", "dist", { recursive: true });
const result = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  alias: {
    "react-dom/client": "preact/compat/client",
    "react-dom": "preact/compat",
    react: "preact/compat",
  },
  minify: true,
  format: "esm",
  target: ["es2022"],
  external: ["./noto-sans-kr-subset.woff2"],
  outdir: "dist/assets",
  entryNames: "app-[hash]",
  metafile: true,
  logLevel: "info",
});
const outputs = Object.keys(result.metafile.outputs);
const js = outputs.find((p) => p.endsWith(".js"));
const css = outputs.find((p) => p.endsWith(".css"));
const template = await readFile("index.html", "utf8");
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
