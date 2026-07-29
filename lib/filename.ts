function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** [categoria]-[tipo]-[fecha]-[titulo-corto].ext */
export function buildFileName(params: {
  categoriaId: string;
  assetTypeId: string;
  titulo: string;
  extension: string;
}): string {
  const fecha = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const tituloCorto = slugify(params.titulo) || "sin-titulo";
  return `${params.categoriaId}-${params.assetTypeId}-${fecha}-${tituloCorto}.${params.extension}`;
}
