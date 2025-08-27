import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** @type {import('next').NextConfig} */

  async headers() {
    return [
      {
        // match all files under /public
        source: "/:all*(svg|jpg|png|woff|woff2|ttf|otf|json)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // or "https://grida.co" (let's decide ths later)
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
