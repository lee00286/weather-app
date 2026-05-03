import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// 'unsafe-inline' is required for the dark-mode FOIT-prevention <script>
// in src/app/layout.tsx (reads localStorage and toggles `dark` before paint).
// 'unsafe-eval' is required only in development for React Fast Refresh and
// debug callstack reconstruction; production bundles don't need it.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://api.open-meteo.com https://archive-api.open-meteo.com https://api.weatherapi.com",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
