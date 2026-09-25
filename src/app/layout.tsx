import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { APP_CONFIG } from '../config/app.config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - Interactive 3D Augmented Reality`,
  description: APP_CONFIG.description,
  keywords: [
    'WebAR',
    'Augmented Reality',
    'MediaPipe',
    'Three.js',
    'Hand Tracking',
    'Hologram',
    'WebGL',
    'VFX',
    'React Three Fiber',
  ],
  authors: [{ name: APP_CONFIG.author }],
  openGraph: {
    title: `${APP_CONFIG.name} - Interactive 3D Augmented Reality`,
    description: APP_CONFIG.description,
    type: 'website',
    url: APP_CONFIG.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-black text-white selection:bg-cyan-500 selection:text-black"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
