// src/app/share/route.ts
// NOTA: Nueva ruta que usa query params para mayor compatibilidad

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company');
  const imagePath = searchParams.get('image');
  
  if (!companyId || !imagePath) {
    return new NextResponse('Missing required query parameters: company, image', { status: 400 });
  }
  
  // Construir la URL completa de la imagen
  const bucketName = 'websapmax-images';
  const imageUrl = `https://storage.googleapis.com/${bucketName}/share-images/${companyId}/${imagePath}`;
  
  // Obtener información de la empresa para personalizar los metadatos
  let companyName = '¡Mira nuestro delicioso menú!';
  let customMessage = 'Descubre nuestros platillos más deliciosos 🌮🥗🍰';
  
  try {
    const db = getDb();
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      companyName = data.businessName || data.name || companyName;
      customMessage = data.customShareMessage || customMessage;
    }
  } catch (error) {
    console.error('Error fetching company data for share link:', error);
  }
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName}</title>
    
    <!-- Meta tags Open Graph -->
    <meta property="og:title" content="${companyName}" />
    <meta property="og:description" content="${customMessage}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="WebSap" />
    
    <!-- Meta tags Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${companyName}" />
    <meta name="twitter:description" content="${customMessage}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-w: 500px;
            width: 90%;
        }
        .image {
            max-width: 100%;
            height: auto;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .title {
            color: #333;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .subtitle {
            color: #666;
            font-size: 18px;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        .btn {
            background: #25D366;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            margin: 15px 10px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .btn:hover {
            background: #128C7E;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .menu-btn {
            background: #4285f4;
        }
        .menu-btn:hover {
            background: #3367d6;
        }
        .footer {
            color: #999;
            font-size: 14px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🍽️ ${companyName}</h1>
        <p class="subtitle">${customMessage}</p>
        
        <img src="${imageUrl}" alt="Menú de ${companyName}" class="image" />
        
        <div>
            <a href="https://websap.site/menu/${companyId}" target="_blank" class="btn menu-btn">
                📱 Ver menú completo
            </a>
        </div>
        
        <div class="footer">
            <p><strong>🌐 websap.site</strong></p>
            <p>Tu menú digital profesional</p>
        </div>
    </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
