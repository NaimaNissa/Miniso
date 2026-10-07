import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-side auth + role routing is incompatible with Cache Components /
  // partial prefetch instant-navigation checks (drops login & dashboard segments).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
