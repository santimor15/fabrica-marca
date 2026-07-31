import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Browser, Page } from "puppeteer-core";
import type { AssetType } from "@/config/asset-types";

const OUTPUT_DIR = path.join(process.cwd(), "output");
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function saveCopy(fileName: string, data: Buffer | string): Promise<void> {
  if (IS_SERVERLESS) return; // filesystem de solo lectura salvo /tmp; no hace falta persistir ahí
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, fileName), data);
}

async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function launchBrowser(): Promise<Browser> {
  if (IS_SERVERLESS) {
    // Vercel/Lambda: puppeteer con Chromium completo no entra en el límite de tamaño
    // de la función ni trae las librerías del sistema que necesita headless Chrome.
    // @sparticuz/chromium provee un binario armado para este entorno.
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = await import("puppeteer-core");
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Local: puppeteer con su Chromium propio.
  const puppeteer = (await import("puppeteer")).default;
  // userDataDir único por lanzamiento: evita colisiones "browser already running"
  // cuando dos exportaciones caen cerca en el tiempo.
  const userDataDir = path.join(os.tmpdir(), `fabrica-assets-puppeteer-${randomUUID()}`);
  // pipe:true — algunos entornos de desarrollo sandboxeados bloquean el WebSocket que
  // Puppeteer usa por default para hablar con Chrome; el transporte por pipe sí funciona.
  return puppeteer.launch({ headless: true, userDataDir, pipe: true }) as unknown as Browser;
}

async function closeBrowserSafely(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch (err) {
    // En Windows, la limpieza del profile temporal de Puppeteer puede fallar con
    // EBUSY (archivo bloqueado por el propio proceso al cerrar). El navegador ya
    // cerró y el resultado ya se capturó antes de llegar acá, así que no es fatal.
    console.warn("Aviso: no se pudo limpiar el perfil temporal de Puppeteer:", err);
  }
}

export async function renderToPng(html: string, assetType: AssetType, fileName: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: assetType.ancho, height: assetType.alto, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });
    await waitForFonts(page);
    const screenshot = await page.screenshot({ type: "png" });
    const buffer = Buffer.from(screenshot);
    await saveCopy(fileName, buffer);
    return buffer;
  } finally {
    await closeBrowserSafely(browser);
  }
}

export async function renderToPdf(html: string, assetType: AssetType, fileName: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: assetType.ancho, height: assetType.alto });
    await page.setContent(html, { waitUntil: "load" });
    await waitForFonts(page);
    const pdf = await page.pdf({
      width: `${assetType.ancho}px`,
      height: `${assetType.alto}px`,
      printBackground: true,
      pageRanges: "",
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    const buffer = Buffer.from(pdf);
    await saveCopy(fileName, buffer);
    return buffer;
  } finally {
    await closeBrowserSafely(browser);
  }
}

export async function saveHtmlExport(html: string, fileName: string): Promise<Buffer> {
  const buffer = Buffer.from(html, "utf-8");
  await saveCopy(fileName, html);
  return buffer;
}
