import Link from "next/link";
import { CATEGORIAS } from "@/config/asset-types";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 gap-12">
      <header className="text-center max-w-2xl">
        <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--brand-primary)" }}>
          CocoSandía Lingerie
        </p>
        <h1 className="text-4xl font-extrabold mt-2">Fábrica de Assets de Marca</h1>
        <p className="mt-3 text-base opacity-70">Elegí una categoría para generar tu pieza.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.id}`}
            className="rounded-2xl p-8 flex flex-col gap-2 text-white shadow-[var(--shadow-lg)] transition hover:-translate-y-1"
            style={{ background: "var(--gradient-tropical)" }}
          >
            <span className="text-2xl font-bold">{cat.nombre}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
