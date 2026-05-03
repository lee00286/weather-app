import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SkipLink } from '@/components/ui/SkipLink';

import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Weather',
    template: '%s · Weather',
  },
  description: 'Real-time weather forecasts, alerts, and trends for any location.',
  applicationName: 'Weather',
  openGraph: {
    type: 'website',
    siteName: 'Weather',
    title: 'Weather',
    description: 'Real-time weather forecasts, alerts, and trends for any location.',
  },
  twitter: {
    card: 'summary',
    title: 'Weather',
    description: 'Real-time weather forecasts, alerts, and trends for any location.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Inline script that runs before the body paints. Reads the persisted theme
// (or falls back to the OS preference) and toggles the `dark` class on
// <html>, preventing a flash of the wrong theme. Kept tiny on purpose — no
// imports, no module references.
const themeInitScript = `(()=>{try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
