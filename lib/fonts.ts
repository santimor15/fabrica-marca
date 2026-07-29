import fs from "node:fs/promises";
import path from "node:path";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

async function toBase64(fileName: string): Promise<string> {
  const buffer = await fs.readFile(path.join(FONTS_DIR, fileName));
  return buffer.toString("base64");
}

/**
 * @font-face embebidas en base64 para que las piezas exportadas (PNG/PDF/HTML)
 * sean 100% autocontenidas, sin depender del servidor de la app ni de internet.
 */
export async function buildFontFaceCss(): Promise<string> {
  const [display, displayBold, body, bodyBold, bodyItalic] = await Promise.all([
    toBase64("PerpetuaTitlingMT-Light.ttf"),
    toBase64("PerpetuaTitlingMT-Bold.ttf"),
    toBase64("Perpetua-Regular.ttf"),
    toBase64("Perpetua-Bold.ttf"),
    toBase64("Perpetua-Italic.ttf"),
  ]);

  return `
<style>
@font-face {
  font-family: "Perpetua Titling MT";
  src: url(data:font/ttf;base64,${display}) format("truetype");
  font-weight: 300 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Perpetua Titling MT";
  src: url(data:font/ttf;base64,${displayBold}) format("truetype");
  font-weight: 600 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Perpetua";
  src: url(data:font/ttf;base64,${body}) format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Perpetua";
  src: url(data:font/ttf;base64,${bodyBold}) format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Perpetua";
  src: url(data:font/ttf;base64,${bodyItalic}) format("truetype");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
</style>`.trim();
}

/** Inserta el bloque de @font-face justo después de <head>. */
export function injectFontFaces(html: string, fontFaceCss: string): string {
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>\n${fontFaceCss}`);
  }
  if (html.includes("<head ")) {
    return html.replace(/<head([^>]*)>/, `<head$1>\n${fontFaceCss}`);
  }
  // Sin <head> explícito: lo anteponemos al documento.
  return `${fontFaceCss}\n${html}`;
}
