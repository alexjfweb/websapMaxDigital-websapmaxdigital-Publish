// src/app/api/share/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { firebaseConfig } from '@/lib/firebase-config';

const BUCKET_NAME = 'websapmax-images';

function escapeHtml(text: string) {
    if (!text) return '';
    return text
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company');
  const imagePath = searchParams.get('image');

  if (!companyId) {
    return new NextResponse('Falta el parámetro "company".', { status: 400 });
  }

  // 1. Obtener la información de la compañía desde Firestore
  let companyName = "Menú Digital";
  let companyDescription = "¡Descubre nuestro delicioso menú!";

  try {
    const db = getDb();
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      companyName = data.name || companyName;
      companyDescription = data.customShareMessage || data.description || companyDescription;
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
  }
  
  // CORRECCIÓN: La URL del proxy siempre debe usar el dominio de producción.
  const imageUrl = imagePath 
    ? `https://www.websap.site/api/proxy-image/share-images/${companyId}/${decodeURIComponent(imagePath)}` 
    : '';
  // CORRECCIÓN: La URL canónica del menú también debe usar el dominio de producción.
  const menuUrl = `https://www.websap.site/menu/${companyId}`;

  // 3. Generar el HTML con todas las metaetiquetas necesarias
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(companyName)}</title>
        
        <!-- Meta tags básicos -->
        <meta name="description" content="${escapeHtml(companyDescription)}" />
        
        <!-- Meta tags Open Graph para WhatsApp/Facebook -->
        <meta property="og:title" content="${escapeHtml(companyName)}" />
        <meta property="og:description" content="${escapeHtml(companyDescription)}" />
        ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
        ${imageUrl ? `<meta property="og:image:secure_url" content="${imageUrl}" />` : ''}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content="${menuUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="WebSapMax" />
        <meta property="og:locale" content="es_ES" />
        <meta property="fb:app_id" content="${firebaseConfig.appId}" />

        <!-- Meta tags Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapeHtml(companyName)}" />
        <meta name="twitter:description" content="${escapeHtml(companyDescription)}" />
        ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ''}
        ${imageUrl ? `<meta name="twitter:image:alt" content="Vista previa del menú de ${escapeHtml(companyName)}" />` : ''}
        
        <!-- Redirección con meta refresh. Esto se ejecutará después de que el rastreador lea las etiquetas. -->
        <meta http-equiv="refresh" content="0; url=${menuUrl}" />
        
        <style>
            body { font-family: sans-serif; background-color: #f0f2f5; text-align: center; padding: 50px; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <h1>Redirigiendo a nuestro menú...</h1>
        <div class="loader"></div>
        <p>Si no eres redirigido automáticamente, <a href="${menuUrl}">haz clic aquí</a>.</p>
    </body>
    </html>
  `;

  // 4. Devolver la respuesta HTML
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
