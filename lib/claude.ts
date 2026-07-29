import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import type { AssetType } from "@/config/asset-types";
import { buildFontFaceCss, injectFontFaces } from "@/lib/fonts";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");
const TOKENS_PATH = path.join(process.cwd(), "design-system", "tokens.css");
const IMAGE_PLACEHOLDER = "{{IMAGEN_SRC}}";
const MODEL = "claude-sonnet-5";

const BRAND_CONTEXT = `Marca: Cocosandía — lencería y estilo femenino, enfocada en empoderamiento, identidad, erotismo y divinidad. Instagram: @cocosandialingerie — bio: "No es solo un gusto, es una necesidad 💗✨".

Voz de marca (de la guía oficial en Claude Design):
- Español informal "tú" (nunca "usted"). Copy corto, seguro, sensual — nunca cursi/infantil.
- Sentence case en el cuerpo; titulares pueden ir en mayúsculas para énfasis en frases cortas (ej. "ES TUYO."). Evitar Title Case.
- Frases declarativas cortas, segunda persona, marco de pertenencia/deseo ("Hecho para ti", "Tu piel, tus reglas").
- Emoji con moderación (1-2 por pieza, 💗 ✨), nunca en cadena, nunca emoji de comida/novedad.
- Temas: empoderamiento, identidad, erotismo, divinidad — tratar a la clienta como ya poderosa/divina, no "en camino a serlo". Nunca apologético ni tímido sobre el cuerpo o la sexualidad.
- Evitar: lenguaje corporativo/retail ("¡Compra ahora! ¡Ofertas increíbles!"), exceso de signos de exclamación, muletillas en inglés cuando hay palabra en español natural.

Fundamentos visuales:
- Fondos full-bleed de fotografía real son el centro; sin foto, usar superficie blush suave o el gradiente tropical (var(--gradient-tropical)) como bloque de acento — nunca como patrón repetido.
- Radios generosos (12px tarjetas/inputs, 20-28px paneles grandes, pill completo en botones/tags).
- Sombras suaves y poco profundas; el glow de color (var(--shadow-glow-pink)) solo en CTAs primarios.
- Sin iconos inventados: si hace falta un ícono funcional, usar un set neutro de trazo fino (Lucide) y marcarlo como sustitución.`;

function getClient(): Anthropic {
  return new Anthropic();
}

async function readTokens(): Promise<string> {
  return fs.readFile(TOKENS_PATH, "utf-8");
}

async function readExistingTemplate(assetTypeId: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(TEMPLATES_DIR, `${assetTypeId}.html`), "utf-8");
  } catch {
    return null;
  }
}

async function saveTemplate(assetTypeId: string, html: string): Promise<void> {
  await fs.mkdir(TEMPLATES_DIR, { recursive: true });
  await fs.writeFile(path.join(TEMPLATES_DIR, `${assetTypeId}.html`), html, "utf-8");
}

function extractHtml(text: string): string {
  const fenced = text.match(/```html\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const doc = text.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
  if (doc) return doc[0].trim();
  return text.trim();
}

function stripDataUrlPrefix(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

function detectMediaType(dataUrl: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const type = match?.[1];
  if (type === "image/jpeg" || type === "image/png" || type === "image/gif" || type === "image/webp") {
    return type;
  }
  return "image/png";
}

function buildDimensionRules(assetType: AssetType): string {
  if (assetType.formatoExport === "html") {
    return `Página web de ancho ${assetType.ancho}px pensada como landing de campaña de una sola página larga (scrollea verticalmente). Incluí al menos: hero con título y texto principal, sección de datos clave, y un botón de llamada a la acción (CTA) bien visible enlazando a la URL indicada.`;
  }
  if (assetType.multiPage) {
    return `Documento multipágina. Cada página/slide debe medir EXACTAMENTE ${assetType.ancho}px de ancho por ${assetType.alto}px de alto, usando <section class="page" style="width:${assetType.ancho}px;height:${assetType.alto}px;page-break-after:always;overflow:hidden;box-sizing:border-box;"> por cada página. La última sección no necesita "page-break-after".`;
  }
  return `Lienzo único de EXACTAMENTE ${assetType.ancho}px de ancho por ${assetType.alto}px de alto. El <body> y el contenedor raíz deben medir esas dimensiones exactas, sin scroll ni overflow visible.`;
}

function buildCommonRules(assetType: AssetType, tienesImagen: boolean, tokens: string): string {
  return `
Reglas estrictas:
- Devolvé SOLO un documento HTML completo y autocontenido (<!DOCTYPE html>...</html>), sin explicaciones antes ni después ni bloques de markdown.
- Todo el CSS va inline en un <style> dentro del <head>. No uses frameworks ni CSS externo ni links a Google Fonts: las tipografías de marca ("Perpetua Titling MT" para var(--font-display), "Perpetua" para var(--font-body)) ya se inyectan automáticamente vía @font-face — solo usá font-family: var(--font-display) / var(--font-body), nunca declares @font-face vos mismo.
- var(--font-display) ("Perpetua Titling MT") es una fuente de TITULARES en mayúsculas: usala con text-transform: uppercase y buen letter-spacing para títulos, wordmarks o cifras destacadas. var(--font-body) ("Perpetua") es para el texto de cuerpo, en mayúsculas y minúsculas normales.
- Usá EXCLUSIVAMENTE los colores y variables de este design system (no inventes otros colores ni fuentes). Copiá estas variables tal cual dentro de tu <style>, en un bloque :root:

${tokens}

- ${buildDimensionRules(assetType)}
- Reseteá margin/padding de html y body a 0.
- Nunca generes markdown, texto plano ni un layout genérico de documento — es una pieza de marca real, con jerarquía visual clara, uso de color de marca, tipografía y composición profesional (no un bloque de texto centrado sin más).
- ${
    tienesImagen
      ? `Se proporcionó una imagen para esta pieza. Incluila con exactamente <img src="${IMAGE_PLACEHOLDER}" style="..."> (usá literalmente ese texto como src, NO generes ni inventes datos base64) y posicionala con object-fit/recorte prolijo según el layout.`
      : `No hay imagen para esta pieza. Resolvé el diseño solo con color, tipografía y formas — no dejes espacios vacíos ni placeholders de imagen rotos.`
  }
- Marcá las zonas de contenido editable con atributos data-slot (ej. data-slot="titulo", data-slot="texto", data-slot="datosClave") para que la plantilla se pueda reutilizar después con otro contenido.
`.trim();
}

export interface GenerateResult {
  html: string;
  reusedTemplate: boolean;
}

export async function generateAsset(
  assetType: AssetType,
  contenido: Record<string, unknown>,
  imagenDataUrl?: string
): Promise<GenerateResult> {
  const tokens = await readTokens();
  const existingTemplate = await readExistingTemplate(assetType.id);
  const tieneImagen = Boolean(imagenDataUrl);
  const rules = buildCommonRules(assetType, tieneImagen, tokens);

  let instructions: string;
  if (existingTemplate) {
    instructions = `Ya existe esta plantilla HTML reutilizable para "${assetType.nombre}". Mantené su estructura, layout y jerarquía visual; ajustá solo lo necesario por overflow de texto, cantidad de datos clave, o para agregar/quitar el slot de imagen según corresponda esta vez.

PLANTILLA EXISTENTE:
${existingTemplate}

CONTENIDO NUEVO A APLICAR:
${JSON.stringify(contenido, null, 2)}

${rules}`;
  } else {
    instructions = `No existe todavía una plantilla para el tipo de asset "${assetType.nombre}" (${assetType.descripcion}). Diseñá una plantilla nueva, profesional y reutilizable, y completala con este contenido:

CONTENIDO:
${JSON.stringify(contenido, null, 2)}

${rules}`;
  }

  const content: Anthropic.Messages.ContentBlockParam[] = [{ type: "text", text: instructions }];
  if (imagenDataUrl) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: detectMediaType(imagenDataUrl),
        data: stripDataUrlPrefix(imagenDataUrl),
      },
    });
  }

  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: assetType.multiPage ? 24000 : 12000,
    system: `Sos un diseñador de marca senior. ${BRAND_CONTEXT}`,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "Claude cortó la respuesta por límite de longitud antes de terminar el HTML. Probá de nuevo (a veces genera una versión más compacta)."
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  let html = extractHtml(textBlock && textBlock.type === "text" ? textBlock.text : "");

  if (!html.includes("</html>")) {
    throw new Error("La respuesta de Claude no incluyó un documento HTML completo. Probá generar de nuevo.");
  }

  if (!existingTemplate) {
    // Guardamos la versión con el placeholder intacto, sin la imagen de este pedido, para reuso futuro.
    await saveTemplate(assetType.id, html);
  }

  if (imagenDataUrl) {
    html = html.split(IMAGE_PLACEHOLDER).join(imagenDataUrl);
  }

  const fontFaceCss = await buildFontFaceCss();
  html = injectFontFaces(html, fontFaceCss);

  return { html, reusedTemplate: Boolean(existingTemplate) };
}
