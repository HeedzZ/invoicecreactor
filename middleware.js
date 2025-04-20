import { NextResponse } from 'next/server';

// Ce middleware offre une protection contre la vulnérabilité CVE-2025-29927
export function middleware(request) {
  // Si l'en-tête vulnérable est présent, refuser la requête
  if (request.headers.has('x-middleware-subrequest')) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Autrement, continuer la requête normalement
  return NextResponse.next();
}

// Appliquer ce middleware à toutes les routes
export const config = {
  matcher: [
    /*
     * Correspond à toutes les routes sauf:
     * 1. Les requêtes d'API qui n'ont pas besoin d'être protégées de cette manière
     * 2. Les ressources statiques (_next/static, favicon.ico, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 