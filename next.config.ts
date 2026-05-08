import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // X-XSS-Protection is deprecated in modern browsers; CSP covers this
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Allow microphone for audio transcription feature
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // next/font self-hosts Inter & Lora — no external font CDN needed
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://api.qrserver.com",
      "font-src 'self' data:",
      // API calls made server-side; blob: for audio recording
      "connect-src 'self' blob:",
      "media-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  headers: () => Promise.resolve([{ source: '/:path*', headers: securityHeaders }]),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/v1/create-qr-code/**' },
    ],
  },
};

export default nextConfig;
