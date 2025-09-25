import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint hatalarını geçici olarak ignore et
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Güvenlik başlıklarını ekle
  async headers() {
    return [
      {
        // Tüm route'lar için güvenlik başlıkları
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Clickjacking saldırılarına karşı koruma
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIME type sniffing'i engelle
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Referrer bilgilerini kısıtla
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // XSS koruması
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // HTTPS zorunlu kıl
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Tarayıcı izinlerini kısıtla
          },
        ],
      },
    ];
  },
};

export default nextConfig;
