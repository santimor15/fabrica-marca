"use client";

interface Props {
  html: string | null;
  ancho: number;
  alto: number; // 0 = alto libre (landing page)
  loading?: boolean;
}

const MAX_W = 460;
const MAX_BOX_H = 560;

export function LivePreview({ html, ancho, alto, loading }: Props) {
  const scale = Math.min(1, MAX_W / ancho);
  const frameHeight = alto > 0 ? alto : 2400;
  const scaledWidth = ancho * scale;
  const scaledHeight = frameHeight * scale;
  const boxHeight = Math.min(scaledHeight, MAX_BOX_H);

  return (
    <div
      className="rounded-2xl border border-black/10 bg-white flex items-start justify-center overflow-auto"
      style={{ width: scaledWidth + 2, height: Math.max(boxHeight, 200) }}
    >
      {loading ? (
        <div className="flex items-center justify-center w-full h-full text-sm opacity-50">Generando…</div>
      ) : html ? (
        <div style={{ width: scaledWidth, height: scaledHeight }}>
          <iframe
            title="Vista previa"
            srcDoc={html}
            scrolling="no"
            style={{
              width: ancho,
              height: frameHeight,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-sm opacity-40 px-6 text-center">
          Completá el formulario y generá la vista previa
        </div>
      )}
    </div>
  );
}
