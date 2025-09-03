// WinMore Trading System Root Layout
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });
const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'WinMore Trading System',
  description: 'Disciplined trading platform focused on winning more trades than losing',
  keywords: 'trading, stocks, discipline, winmore, portfolio, consistency',
  robots: 'noindex, nofollow', // Keep private
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} ${ibmPlexMono.variable} h-full bg-black text-white`}>
        <ErrorBoundary>
          <div id="root" className="h-full">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}