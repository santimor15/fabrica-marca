export type FieldType = "text" | "textarea" | "bullets" | "image" | "number";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
}

export type ExportFormat = "png" | "pdf" | "html";

export interface AssetType {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  formatoExport: ExportFormat;
  /** Dimensiones del lienzo en px. Para PDF multipágina, es el tamaño de cada página. */
  ancho: number;
  alto: number;
  multiPage?: boolean;
  campos: FieldDef[];
}

export interface Categoria {
  id: string;
  nombre: string;
}

export const CATEGORIAS: Categoria[] = [
  { id: "redes", nombre: "Redes sociales" },
  { id: "comercial", nombre: "Comercial" },
  { id: "presentaciones", nombre: "Presentaciones" },
  { id: "landing", nombre: "Landing page" },
];

// --- Campos reutilizados entre tipos de asset ---
const CAMPO_TITULO: FieldDef = {
  id: "titulo",
  label: "Título",
  type: "text",
  required: true,
  placeholder: "Ej. Nueva colección disponible",
};

const CAMPO_TEXTO: FieldDef = {
  id: "texto",
  label: "Texto / cuerpo",
  type: "textarea",
  required: true,
  placeholder: "El mensaje principal de la pieza",
};

const CAMPO_DATOS_CLAVE: FieldDef = {
  id: "datosClave",
  label: "Datos clave",
  type: "bullets",
  helpText: "Un dato por línea (precios, beneficios, fechas, etc.)",
};

const CAMPO_IMAGEN: FieldDef = {
  id: "imagen",
  label: "Imagen (opcional)",
  type: "image",
};

export const ASSET_TYPES: AssetType[] = [
  // --- Redes sociales ---
  {
    id: "post-cuadrado",
    categoriaId: "redes",
    nombre: "Post cuadrado",
    descripcion: "1080 × 1080 — feed de Instagram/Facebook",
    formatoExport: "png",
    ancho: 1080,
    alto: 1080,
    campos: [CAMPO_TITULO, CAMPO_TEXTO, CAMPO_DATOS_CLAVE, CAMPO_IMAGEN],
  },
  {
    id: "quote-card",
    categoriaId: "redes",
    nombre: "Quote card",
    descripcion: "1080 × 1080 — frase o testimonio destacado",
    formatoExport: "png",
    ancho: 1080,
    alto: 1080,
    campos: [
      { ...CAMPO_TITULO, label: "Frase", placeholder: "La frase o testimonio a destacar" },
      { ...CAMPO_TEXTO, label: "Atribución", required: false, placeholder: "Quién lo dijo / contexto" },
      CAMPO_IMAGEN,
    ],
  },
  {
    id: "banner-horizontal",
    categoriaId: "redes",
    nombre: "Banner horizontal",
    descripcion: "1200 × 628 — portada de Facebook, banner de link",
    formatoExport: "png",
    ancho: 1200,
    alto: 628,
    campos: [CAMPO_TITULO, CAMPO_TEXTO, CAMPO_DATOS_CLAVE, CAMPO_IMAGEN],
  },
  {
    id: "historia-vertical",
    categoriaId: "redes",
    nombre: "Historia vertical",
    descripcion: "1080 × 1920 — historias de Instagram/Facebook",
    formatoExport: "png",
    ancho: 1080,
    alto: 1920,
    campos: [CAMPO_TITULO, CAMPO_TEXTO, CAMPO_DATOS_CLAVE, CAMPO_IMAGEN],
  },

  // --- Comercial ---
  {
    id: "oferta-comercial",
    categoriaId: "comercial",
    nombre: "Oferta / propuesta comercial",
    descripcion: "PDF multipágina para enviar a un cliente",
    formatoExport: "pdf",
    ancho: 794,
    alto: 1123,
    multiPage: true,
    campos: [
      CAMPO_TITULO,
      { id: "cliente", label: "Cliente / destinatario", type: "text", placeholder: "Nombre del cliente" },
      CAMPO_TEXTO,
      { ...CAMPO_DATOS_CLAVE, helpText: "Qué incluye la oferta, precios, condiciones — un dato por línea" },
      CAMPO_IMAGEN,
    ],
  },
  {
    id: "one-pager-servicio",
    categoriaId: "comercial",
    nombre: "One-pager de servicio",
    descripcion: "PDF de una página que resume un servicio",
    formatoExport: "pdf",
    ancho: 794,
    alto: 1123,
    campos: [CAMPO_TITULO, CAMPO_TEXTO, CAMPO_DATOS_CLAVE, CAMPO_IMAGEN],
  },

  // --- Presentaciones ---
  {
    id: "deck-corto",
    categoriaId: "presentaciones",
    nombre: "Deck corto",
    descripcion: "5 a 8 slides, PDF 1920 × 1080",
    formatoExport: "pdf",
    ancho: 1920,
    alto: 1080,
    multiPage: true,
    campos: [
      CAMPO_TITULO,
      {
        id: "slides",
        label: "Contenido de los slides",
        type: "textarea",
        required: true,
        helpText: "Un slide por línea o bloque: título breve + idea principal. Claude lo organiza en 5-8 slides.",
      },
      { id: "numSlides", label: "Cantidad de slides", type: "number", min: 5, max: 8 },
      CAMPO_IMAGEN,
    ],
  },
  {
    id: "portada-presentacion",
    categoriaId: "presentaciones",
    nombre: "Portada de presentación",
    descripcion: "1920 × 1080 — slide de portada",
    formatoExport: "pdf",
    ancho: 1920,
    alto: 1080,
    campos: [
      CAMPO_TITULO,
      { ...CAMPO_TEXTO, label: "Subtítulo", required: false },
      CAMPO_IMAGEN,
    ],
  },

  // --- Landing page ---
  {
    id: "landing-campana",
    categoriaId: "landing",
    nombre: "Landing page de campaña",
    descripcion: "HTML autocontenido y descargable, listo para hostear",
    formatoExport: "html",
    ancho: 1280,
    alto: 0, // alto libre: la landing scrollea
    campos: [
      CAMPO_TITULO,
      { ...CAMPO_TEXTO, label: "Texto principal" },
      CAMPO_DATOS_CLAVE,
      { id: "ctaTexto", label: "Texto del botón (CTA)", type: "text", placeholder: "Ej. Comprá ahora" },
      { id: "ctaUrl", label: "Link del botón (CTA)", type: "text", placeholder: "https://..." },
      CAMPO_IMAGEN,
    ],
  },
];

export function getAssetType(id: string): AssetType | undefined {
  return ASSET_TYPES.find((a) => a.id === id);
}

export function getAssetTypesByCategoria(categoriaId: string): AssetType[] {
  return ASSET_TYPES.filter((a) => a.categoriaId === categoriaId);
}
