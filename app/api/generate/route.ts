import { NextRequest, NextResponse } from "next/server";
import { getAssetType } from "@/config/asset-types";
import { generateAsset, SafeGenerationError } from "@/lib/claude";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta ANTHROPIC_API_KEY en .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { assetTypeId, contenido, imagenDataUrl } = body as {
    assetTypeId?: string;
    contenido?: Record<string, unknown>;
    imagenDataUrl?: string;
  };

  if (!assetTypeId || !contenido) {
    return NextResponse.json(
      { error: "Faltan assetTypeId o contenido" },
      { status: 400 }
    );
  }

  const assetType = getAssetType(assetTypeId);
  if (!assetType) {
    return NextResponse.json(
      { error: `Tipo de asset desconocido: ${assetTypeId}` },
      { status: 400 }
    );
  }

  try {
    const result = await generateAsset(assetType, contenido, imagenDataUrl);
    return NextResponse.json(result);
  } catch (err) {
    // El detalle completo (puede incluir texto interno del SDK/headers) solo va a los logs
    // del servidor — nunca al cliente, para no filtrar información sensible en pantalla.
    console.error("Error generando asset:", err);
    const safeMessage =
      err instanceof SafeGenerationError ? err.message : "No se pudo generar la pieza. Probá de nuevo en un momento.";
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
