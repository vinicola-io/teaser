import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./main.jsx";
import { configSignature, normalizeSettings } from "./settings.js";
import "./styles.css";
import "./prerender.css";

const root = document.getElementById("root");
const settings = normalizeSettings(window.VINICOLA_CONFIG);
const signature = configSignature(settings);
const view = <App settings={settings} />;

if (root.dataset.configSignature === signature) {
  hydrateRoot(root, view);
} else {
  // Runtime config fixtures or an independently updated public config must not
  // preserve stale server-generated form links during hydration.
  root.replaceChildren();
  root.dataset.configSignature = signature;
  createRoot(root).render(view);
}
