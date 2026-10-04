/** @type {import('next').NextConfig} */
const nextConfig = {
  // Render раздаёт через свой прокси — standalone даёт меньший образ
  // и быстрый холодный старт.
  output: "standalone",

  images: {
    // Рендеры отдаются с того же origin: либо /uploads/* (локально),
    // либо /api/uploads/* (Render disk). Внешние хосты не нужны.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  eslint: {
    // Деплой не должен падать из-за линта
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
