import type { NextConfig } from "next";

/**
 * Configuration Next.js de DIGITAL TWIN.
 *
 * - cacheComponents + partialPrefetching : modèle de rendu par défaut de Next 16.
 *   La coquille de l'application (navigation, en-têtes) est pré-rendue ; tout ce
 *   qui dépend de l'utilisateur ou de la requête est streamé derrière <Suspense>.
 * - Les en-têtes de sécurité s'appliquent à toutes les routes.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
