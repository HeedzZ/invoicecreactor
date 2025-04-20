/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Ajout d'en-têtes de sécurité pour toutes les pages
  async headers() {
    return [
      {
        // Appliquer ces en-têtes à toutes les routes
        source: '/:path*',
        headers: [
          // Protection contre le clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Prévention de la détection MIME-type
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Protection XSS basique
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Désactive le caching des réponses contenant des données sensibles
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ];
  },

  // Augmenter le niveau de journalisation pour mieux détecter les tentatives d'exploitation
  onDemandEntries: {
    // période en ms pendant laquelle la page restera en mémoire
    maxInactiveAge: 25 * 1000,
    // nombre de pages à garder en mémoire
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
