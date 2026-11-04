import type { NextConfig } from "next";

// NEXT_PUBLIC_PLATFORM = gcs | kimexdi | (absent = hub multi-plateformes).
// Lue au moment du build (next.config + middleware) : pour servir une seule
// plateforme, construire avec NEXT_PUBLIC_PLATFORM=kimexdi ou =gcs.
const platform = process.env.NEXT_PUBLIC_PLATFORM ?? "all";
const home =
  platform === "kimexdi"
    ? "/kimexdi"
    : platform === "gcs"
      ? "/gcs"
      : "/tableau-de-bord";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: home, permanent: false },
      // Anciennes routes publiques GCS → nouveau site /gcs.
      { source: "/demande", destination: "/gcs/devis", permanent: false },
      { source: "/demande/:slug", destination: "/gcs/demande/:slug", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
