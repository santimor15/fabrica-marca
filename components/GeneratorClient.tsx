"use client";

import { useState } from "react";
import { AssetType } from "@/config/asset-types";
import { AssetForm } from "@/components/AssetForm";
import { LivePreview } from "@/components/LivePreview";

interface Props {
  assetType: AssetType;
}

export function GeneratorClient({ assetType }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [imagenDataUrl, setImagenDataUrl] = useState<string | undefined>();
  const [html, setHtml] = useState<string | null>(null);
  const [reusedTemplate, setReusedTemplate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetTypeId: assetType.id, contenido: values, imagenDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando la pieza");
      setHtml(data.html);
      setReusedTemplate(data.reusedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!html) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetTypeId: assetType.id, html, titulo: values["titulo"] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // TEMPORAL: muestra data.debug (resumen sanitizado del error) mientras se
        // diagnostica el fallo de exportación en Vercel. Sacar junto con el campo debug.
        throw new Error(data.debug || data.error || "Error exportando la pieza");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const fileName = match ? match[1] : `asset.${assetType.formatoExport}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="flex flex-col gap-5">
        <AssetForm
          campos={assetType.campos}
          values={values}
          onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
          imagenDataUrl={imagenDataUrl}
          onImagenChange={setImagenDataUrl}
        />
        {error && (
          <p className="text-sm font-medium" style={{ color: "var(--pink-500)" }}>
            {error}
          </p>
        )}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full px-6 py-3 font-semibold text-white disabled:opacity-50 transition"
          style={{ background: "var(--gradient-tropical)" }}
        >
          {loading ? "Generando…" : html ? "Regenerar vista previa" : "Generar vista previa"}
        </button>
      </div>

      <div className="flex flex-col gap-4 items-center lg:sticky lg:top-8">
        <LivePreview html={html} ancho={assetType.ancho} alto={assetType.alto} loading={loading} />
        {reusedTemplate !== null && (
          <p className="text-xs opacity-50 text-center">
            {reusedTemplate
              ? "Reutilizando la plantilla ya guardada para este tipo de asset."
              : "Plantilla nueva creada y guardada para la próxima vez."}
          </p>
        )}
        <button
          onClick={handleDownload}
          disabled={!html || exporting}
          className="rounded-full px-6 py-3 font-semibold border-2 disabled:opacity-40 transition"
          style={{ borderColor: "var(--ink-900)", color: "var(--ink-900)" }}
        >
          {exporting ? "Exportando…" : `Descargar ${assetType.formatoExport.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
