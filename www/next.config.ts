import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // default: all files get CORS
      {
        source: "/:all*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
      // svg/:path -> CORS + cache + content-type
      {
        source: "/svg/:path*.svg",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Content-Type",
            value: "image/svg+xml; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
