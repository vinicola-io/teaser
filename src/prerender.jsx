import React from "react";
import { renderToString } from "preact-render-to-string";
import { App } from "./main.jsx";

export function prerender(settings) {
  return renderToString(<App settings={settings} />);
}
