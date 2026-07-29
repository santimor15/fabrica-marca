"use client";

import { ChangeEvent } from "react";
import { FieldDef } from "@/config/asset-types";

interface Props {
  campos: FieldDef[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  imagenDataUrl?: string;
  onImagenChange: (dataUrl: string | undefined) => void;
}

export function AssetForm({ campos, values, onChange, imagenDataUrl, onImagenChange }: Props) {
  function handleImagenFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      onImagenChange(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImagenChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5">
      {campos.map((campo) => {
        if (campo.type === "image") {
          return (
            <div key={campo.id} className="flex flex-col gap-2">
              <label className="text-sm font-semibold">{campo.label}</label>
              <input type="file" accept="image/*" onChange={handleImagenFile} className="text-sm" />
              {imagenDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagenDataUrl}
                  alt="Vista previa de la imagen"
                  className="w-24 h-24 object-cover rounded-lg border border-black/10"
                />
              )}
            </div>
          );
        }

        return (
          <div key={campo.id} className="flex flex-col gap-2">
            <label htmlFor={campo.id} className="text-sm font-semibold">
              {campo.label}
              {campo.required && <span style={{ color: "var(--color-pink)" }}> *</span>}
            </label>
            {campo.type === "textarea" || campo.type === "bullets" ? (
              <textarea
                id={campo.id}
                value={values[campo.id] ?? ""}
                onChange={(e) => onChange(campo.id, e.target.value)}
                placeholder={campo.placeholder}
                required={campo.required}
                rows={campo.type === "bullets" ? 4 : 5}
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]"
              />
            ) : campo.type === "number" ? (
              <input
                id={campo.id}
                type="number"
                min={campo.min}
                max={campo.max}
                value={values[campo.id] ?? ""}
                onChange={(e) => onChange(campo.id, e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]"
              />
            ) : (
              <input
                id={campo.id}
                type="text"
                value={values[campo.id] ?? ""}
                onChange={(e) => onChange(campo.id, e.target.value)}
                placeholder={campo.placeholder}
                required={campo.required}
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]"
              />
            )}
            {campo.helpText && <p className="text-xs opacity-50">{campo.helpText}</p>}
          </div>
        );
      })}
    </div>
  );
}
