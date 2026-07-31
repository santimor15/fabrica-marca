import { NextRequest, NextResponse } from "next/server";
import { getAssetType } from "@/config/asset-types";
import { renderToPdf, renderToPng, saveHtmlExport } from "@/lib/export";
import { buildFileName } from "@/lib/filename";

export const runtime = "nodejs";
// Lanzar Chromium y renderizar puede tardar más que el default de 10s en Vercel.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { assetTypeId, html, titulo } = body as {
    assetTypeId?: string;
    html?: string;
    titulo?: string;
  };

  if (!assetTypeId || !html) {
    return NextResponse.json({ error: "Faltan assetTypeId o html" }, { status: 400 });
  }

  const assetType = getAssetType(assetTypeId);
  if (!assetType) {
    return NextResponse.json({ error: `Tipo de asset desconocido: ${assetTypeId}` }, { status: 400 });
  }

  const extension = assetType.formatoExport;
  const fileName = buildFileName({
    categoriaId: assetType.categoriaId,
    assetTypeId: assetType.id,
    titulo: titulo || "sin-titulo",
    extension,
  });

  try {
    let buffer: Buffer;
    let contentType: string;

    if (assetType.formatoExport === "png") {
      buffer = await renderToPng(html, assetType, fileName);
      contentType = "image/png";
    } else if (assetType.formatoExport === "pdf") {
      buffer = await renderToPdf(html, assetType, fileName);
      contentType = "application/pdf";
    } else {
      buffer = await saveHtmlExport(html, fileName);
      contentType = "text/html";
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    // Detalle completo solo en los logs del servidor, nunca en la respuesta al cliente.
    console.error("Error exportando asset:", err);
    // TEMPORAL: este endpoint no maneja secretos (no toca la API key), así que por ahora
    // devolvemos un resumen sanitizado del error para diagnosticar el fallo en Vercel.
    // Sacar esto en cuanto quede resuelto.
    const debugInfo =
      err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 500) : String(err).slice(0, 500);
    return NextResponse.json(
      { error: "No se pudo exportar el archivo. Probá de nuevo en un momento.", debug: debugInfo },
      { status: 500 }
    );
  }
}
