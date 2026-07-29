import type { Metadata } from "next";
import localFont from "next/font/local";
import "../design-system/tokens.css";
import "./globals.css";

const perpetuaTitling = localFont({
  variable: "--font-perpetua-titling",
  src: [
    { path: "../public/fonts/PerpetuaTitlingMT-Light.ttf", weight: "300 500", style: "normal" },
    { path: "../public/fonts/PerpetuaTitlingMT-Bold.ttf", weight: "600 800", style: "normal" },
  ],
});

const perpetua = localFont({
  variable: "--font-perpetua",
  src: [
    { path: "../public/fonts/Perpetua-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Perpetua-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Perpetua-Italic.ttf", weight: "400", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "Fábrica de Assets — CocoSandía Lingerie",
  description: "Generador de piezas de marca: redes, comercial, presentaciones y landing pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${perpetuaTitling.variable} ${perpetua.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
