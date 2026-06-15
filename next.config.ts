import type { NextConfig } from "next";

const upstream = (process.env.API_BASE_URL || "https://coder.shuyou.ai/backend").replace(
  /\/+$/,
  ""
);

const nextConfig: NextConfig = {
  /** 供浏览器 WebSocket 直连上游（开发时 HTTP 走 localhost 代理，WS 不能走 Next rewrite） */
  env: {
    NEXT_PUBLIC_WS_UPSTREAM: upstream,
  },
  async rewrites() {
    const base = upstream;
    const devFullSiteProxy =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_DEV_FULL_SITE_PROXY !== "0";

    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${base}/api/:path*`,
        },
        {
          source: "/websocket",
          destination: `${base}/websocket`,
        },
      ],
      ...(devFullSiteProxy
        ? {
            // 仅开发：把未匹配的请求转到上游（方便本地当反向代理用）
            fallback: [
              {
                source: "/:path*",
                destination: `${base}/:path*`,
              },
            ],
          }
        : {}),
    };
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "cdn.shuyoutech.com",
      },
    ],
  },
  // 3. 构建时忽略 TypeScript 错误（临时方案）
  typescript: {
    ignoreBuildErrors: true,
  },

  // 4. 构建时忽略 ESLint 错误（可选）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
