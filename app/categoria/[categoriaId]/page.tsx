import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIAS, getAssetTypesByCategoria } from "@/config/asset-types";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoriaId: string }>;
}) {
  const { categoriaId } = await params;
  const categoria = CATEGORIAS.find((c) => c.id === categoriaId);
  if (!categoria) notFound();
  const tipos = getAssetTypesByCategoria(categoriaId);

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 gap-10">
      <div className="w-full max-w-3xl">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100">
          ← Categorías
        </Link>
        <h1 className="text-3xl font-extrabold mt-3">{categoria.nombre}</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {tipos.map((tipo) => (
          <Link
            key={tipo.id}
            href={`/generar/${tipo.id}`}
            className="rounded-2xl p-6 flex flex-col gap-1 bg-white shadow-[var(--shadow-sm)] border border-black/5 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition"
          >
            <span className="text-lg font-bold" style={{ color: "var(--ink-900)" }}>
              {tipo.nombre}
            </span>
            <span className="text-sm opacity-60">{tipo.descripcion}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
