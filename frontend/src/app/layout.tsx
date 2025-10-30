import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Note: Bitcount Grid Single is loaded via Google Fonts link in the HTML head
// The font is configured with CSS variables in globals.css

export const metadata: Metadata = {
  title: 'MatchFlix - Find Your Perfect Match',
  description: 'A modern dating app to connect with people who share your interests',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Kavoon&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
