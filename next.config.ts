import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La plateforme opérationnelle s'ouvre sur le tableau de bord.
  async redirects() {
    return [{ source: '/', destination: '/tableau-de-bord', permanent: false }];
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
