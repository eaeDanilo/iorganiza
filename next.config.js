const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const CSP_PROD = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://hooks.stripe.com https://accounts.google.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// Headers aplicados em todos os ambientes (proteções fundamentais, sem HSTS em dev)
const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // camera=(self): iMaleta usa câmera para leitura de código de barras na conferência.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
];

// Headers extras apenas em produção
const prodOnlyHeaders = [
  { key: 'Content-Security-Policy', value: CSP_PROD },
  // HSTS só em prod: forçar HTTPS em localhost quebraria o dev
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    const headers = [...baseSecurityHeaders, ...(isProd ? prodOnlyHeaders : [])];
    return [{ source: '/(.*)', headers }];
  },
};

module.exports = nextConfig;
