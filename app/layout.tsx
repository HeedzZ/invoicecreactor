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
        
        {/* Script pour charger les variables d'environnement */}
        <Script id="env-script">
          {`
            // Charger les variables d'environnement publiques dans window.ENV
            window.ENV = {
              N8N_WEBHOOK_URL: "${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''}",
              N8N_BASE_URL: "${process.env.NEXT_PUBLIC_N8N_BASE_URL || ''}",
              N8N_INVOICE_WEBHOOK_PATH: "${process.env.NEXT_PUBLIC_N8N_INVOICE_WEBHOOK_PATH || ''}"
            };
            
            // Compatibilité avec l'ancienne configuration
            if (window.ENV.N8N_WEBHOOK_URL && !window.n8nWebhookUrl) {
              window.n8nWebhookUrl = window.ENV.N8N_WEBHOOK_URL;
            }
            
            // Configurer window.appConfig si non défini
            if (!window.appConfig) {
              window.appConfig = {};
            }
            
            if (window.ENV.N8N_BASE_URL) {
              window.appConfig.n8nBaseUrl = window.ENV.N8N_BASE_URL;
            }
            
            if (window.ENV.N8N_INVOICE_WEBHOOK_PATH) {
              window.appConfig.invoiceWebhookPath = window.ENV.N8N_INVOICE_WEBHOOK_PATH;
              window.appConfig.invoiceWebhookUrl = window.ENV.N8N_BASE_URL + '/' + window.ENV.N8N_INVOICE_WEBHOOK_PATH;
              window.appConfig.webhookFullUrl = window.ENV.N8N_WEBHOOK_URL;
            }
          `}
        </Script>
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
