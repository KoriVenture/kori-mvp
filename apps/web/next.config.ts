import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kori/ui",
    "@kori/domain",
    "@kori/web3",
    "@kori/db",
    "@kori/ai",
    "@kori/observability",
  ],
};

export default withNextIntl(nextConfig);
