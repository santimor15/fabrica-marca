import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Puppeteer/Chromium traen binarios nativos: hay que dejarlos afuera del bundle
  // serverless para que Next no intente empaquetarlos con webpack.
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
  // El tracer de Vercel no detecta solo el binario de Chromium (se arma en runtime,
  // no vía require estático) — hay que declarar la carpeta a mano para que la
  // función serverless de /api/export la incluya en el deploy.
  outputFileTracingIncludes: {
    "/api/export/route": ["node_modules/@sparticuz/chromium/bin/**"],
    "/api/export": ["node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
