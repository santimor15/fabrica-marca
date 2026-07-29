import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIAS, getAssetType } from "@/config/asset-types";
import { GeneratorClient } from "@/components/GeneratorClient";

export default async function GenerarPage({
  params,
}: {
  params: Promise<{ assetTypeId: string }>;
}) {
  const { assetTypeId } = await params;
  const assetType = getAssetType(assetTypeId);
  if (!assetType) notFound();
  const categoria = CATEGORIAS.find((c) => c.id === assetType.categoriaId);

  return (
    <main className="flex-1 flex flex-col px-6 py-10 gap-6 max-w-6xl mx-auto w-full">
      <div>
        <Link href={`/categoria/${assetType.categoriaId}`} className="text-sm opacity-60 hover:opacity-100">
          ← {categoria?.nombre}
        </Link>
        <h1 className="text-2xl font-extrabold mt-2">{assetType.nombre}</h1>
        <p className="text-sm opacity-60">{assetType.descripcion}</p>
      </div>
      <GeneratorClient assetType={assetType} />
    </main>
  );
}
