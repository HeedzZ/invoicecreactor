import { NextResponse } from 'next/server';

// Configuration pour indiquer que cette route est dynamique
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const data = await request.json();
    console.log('📦 API PROXY - Données reçues du client:', JSON.stringify(data, null, 2));
    
    // Envoyer les données au webhook externe
    console.log('🔄 API PROXY - Envoi des données au webhook n8n...');
    const response = await fetch('https://yannmti.app.n8n.cloud/webhook-test/a958d501-dee4-49ab-a4cb-f665c8069626', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error('❌ API PROXY - Erreur HTTP:', response.status);
      // Essayer de lire la réponse d'erreur
      try {
        const errorData = await response.json();
        console.error('❌ API PROXY - Détails de l\'erreur:', errorData);
        if (errorData.code === 404 && errorData.message && errorData.message.includes('webhook') && errorData.message.includes('not registered')) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Webhook n8n non enregistré: ${errorData.message}. ${errorData.hint || ''}` 
            },
            { status: 404 }
          );
        }
      } catch (e) {
        // Si on ne peut pas lire l'erreur comme JSON, on continue avec l'erreur générique
      }
      
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    // Vérifier le Content-Type de la réponse
    const contentType = response.headers.get('Content-Type');
    console.log('📋 API PROXY - Content-Type de la réponse n8n:', contentType);
    
    // Si le Content-Type indique que c'est un PDF, traiter directement comme un PDF
    if (contentType && contentType.includes('application/pdf')) {
      console.log('📄 API PROXY - Réponse directe en PDF détectée');
      try {
        // Obtenir le PDF sous forme de buffer
        const arrayBuffer = await response.arrayBuffer();
        // Convertir en base64
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        // Renvoyer comme data URL
        const dataUrl = `data:application/pdf;base64,${base64}`;
        console.log('📄 API PROXY - PDF converti en data URL');
        
        return NextResponse.json({
          success: true,
          data: dataUrl
        });
      } catch (error) {
        console.error('❌ API PROXY - Erreur lors de la conversion du PDF:', error);
        // En cas d'erreur, renvoyer l'URL directe
        return NextResponse.json({
          success: true,
          data: response.url
        });
      }
    }
    
    let responseData;
    let responseText;
    
    try {
      // Essayer de lire la réponse comme JSON d'abord
      responseData = await response.json();
      console.log('📥 API PROXY - Réponse n8n (JSON brut):', JSON.stringify(responseData, null, 2));
      
      // Renvoyer directement les données du webhook sans transformation
      console.log('✅ API PROXY - Renvoi des données JSON au client');
      return NextResponse.json({
        success: true,
        data: responseData
      });
    } catch (e) {
      // Si ce n'est pas du JSON, essayer de lire comme texte
      try {
        // Cloner la réponse pour la réutiliser car response.text() consomme le stream
        const clonedResponse = response.clone();
        responseText = await clonedResponse.text();
        console.log('📝 API PROXY - Réponse n8n (texte):', responseText);
        
        // Si le texte ressemble à une URL de PDF, la renvoyer directement
        if (responseText.includes('.pdf') || responseText.startsWith('data:application/pdf')) {
          console.log('📄 API PROXY - URL PDF détectée:', responseText.substring(0, 100) + '...');
          return NextResponse.json({
            success: true,
            data: responseText.trim()
          });
        }
        
        // Sinon, renvoyer le texte comme donnée
        return NextResponse.json({
          success: true,
          data: responseText
        });
      } catch (textError) {
        console.error('Erreur lors de la lecture de la réponse comme texte:', textError);
        
        // Cas particulier : Si c'est un PDF binaire, renvoyer l'URL
        if (contentType && contentType.includes('application/pdf')) {
          return NextResponse.json({
            success: true,
            data: response.url,
            contentType: contentType
          });
        }
        
        // En dernier recours, renvoyer un message d'erreur
        return NextResponse.json({
          success: false,
          error: 'Format de réponse non géré'
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('Erreur dans le proxy webhook:', error);
    
    // Renvoyer une erreur
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 