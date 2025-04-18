import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Générateur de factures',
  description: 'Créez facilement vos factures professionnelles',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Configuration accessible globalement */}
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body 
        className={inter.className}
        suppressHydrationWarning
      >
        {children}
        
        {/* Script pour nettoyer les attributs non désirés */}
        <Script 
          src="/scripts/attribute-cleaner.js"
          strategy="afterInteractive"
          id="attribute-cleaner"
        />
      </body>
    </html>
  );
}
