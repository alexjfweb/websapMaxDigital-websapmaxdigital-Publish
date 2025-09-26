// src/app/share/[companyId]/[imagePath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; imagePath: string } }
) {
  const { companyId, imagePath } = params;
  
  // Construir la URL completa de la imagen usando los parámetros dinámicos
  const bucketName = 'websapmax-images';
  const imageUrl = `https://storage.googleapis.com/${bucketName}/share-images/${companyId}/${imagePath}`;
  
  // Obtener información de la empresa desde Firestore para personalizar los meta tags
  let companyName = '¡Mira nuestro delicioso menú!';
  let customMessage = 'Descubre nuestros platillos más deliciosos 🌮🥗🍰';
  
  try {
    const db = getDb();
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Usar el nombre de la empresa si está disponible
      companyName = data.businessName || data.name || companyName;
      // Usar el mensaje personalizado si está disponible
      customMessage = data.customShareMessage || customMessage;
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
    // Continuar con valores por defecto si hay error
  }
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName}</title>
    
    <!-- Meta tags Open Graph para WhatsApp -->
    <meta property="og:title" content="${companyName}" />
    <meta property="og:description" content="${customMessage}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="600" />
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
            max-width: 500px;
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
        
        <img src="${imageUrl}" alt="Menú del restaurante" class="image" onerror="this.style.display='none'" />
        
        <div>
            <a href="https://websap.site/menu/${companyId}" target="_blank" class="btn menu-btn">
                📱 Ver menú completo
            </a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${customMessage} https://websap.site/menu/${companyId}`)}" target="_blank" class="btn">
                📤 Compartir menú
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
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
