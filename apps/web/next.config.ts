import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kori/ui",
    "@kori/domain",
    "@kori/web3",
    "@kori/db",
    "@kori/ai",
    "@kori/observability"
  ],
};

export default nextConfig;
