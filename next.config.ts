import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Puppeteer/Chromium traen binarios nativos: hay que dejarlos afuera del bundle
  // serverless para que Next no intente empaquetarlos con webpack.
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
