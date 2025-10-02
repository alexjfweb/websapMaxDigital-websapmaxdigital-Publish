

import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import Image from 'next/image';

type Props = {
  params: { path: string[] };
};

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

// Función auxiliar para asegurar que la URL de la imagen sea válida
function ensureValidImageUrl(url: string | null | undefined): string {
  if (!url) {
    return "https://placehold.co/1200x630.png?text=WebSapMax";
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  return "https://placehold.co/1200x630.png?text=WebSapMax";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;
  
  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    return { title: 'WebSapMax' };
  }

  const companyId = pathParts[1];
  
  let companyName = "Menú Digital";
  let companyDescription = "¡Haz clic para ver nuestras delicias!";
  let finalImageUrl: string;
  
  try {
      const db = getDb();
      const companySnap = await getDoc(doc(db, 'companies', companyId));
      
      if (companySnap.exists()) {
          const companyData = companySnap.data();
          companyName = companyData.name || companyName;
          companyDescription = companyData.customShareMessage || companyData.description || companyDescription;
          
          const rawImageUrl = companyData.customShareImageUrl || companyData.logoUrl;
          finalImageUrl = ensureValidImageUrl(rawImageUrl);

          console.log(`[generateMetadata] CompanyId: ${companyId}`);
          console.log(`[generateMetadata] customShareImageUrl: ${companyData.customShareImageUrl}`);
          console.log(`[generateMetadata] finalImageUrl: ${finalImageUrl}`);

      } else {
        finalImageUrl = "https://placehold.co/1200x630.png?text=WebSapMax";
        console.log(`[generateMetadata] Company not found: ${companyId}`);
      }
  } catch (e) {
      console.error("[generateMetadata] Error fetching metadata:", e);
      finalImageUrl = "https://placehold.co/1200x630.png?text=Error";
  }
  
  const landingUrl = `https://www.websap.site/landing/restaurant/${companyId}`;
  
  return {
    title: escapeHtml(companyName),
    description: escapeHtml(companyDescription),
    openGraph: {
      title: escapeHtml(companyName),
      description: escapeHtml(companyDescription),
      images: [{
        url: finalImageUrl,
        width: 1200,
        height: 630,
        alt: escapeHtml(companyName),
        type: 'image/jpeg',
      }],
      type: 'website',
      siteName: 'WebSapMax',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: escapeHtml(companyName),
      description: escapeHtml(companyDescription),
      images: [finalImageUrl],
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
    }
  };
}


// Este es el componente de la página que se muestra al usuario.
// Su función principal es redirigir al menú después de que el rastreador ha leído los metadatos.
export default async function LandingSharePage({ params }: Props) {
  const pathParts = params.path;

  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    return notFound();
  }

  const companyId = pathParts[1];

  const db = getDb();
  const companySnap = await getDoc(doc(db, 'companies', companyId));

  if (!companySnap.exists()) {
    return notFound();
  }

  const companyData = companySnap.data();
  const rawImageUrl = companyData.customShareImageUrl || companyData.logoUrl;
  const imageUrl = ensureValidImageUrl(rawImageUrl);

  const menuUrl = `https://www.websap.site/menu/${companyId}`;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div 
            className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white"
        >
            <div className="relative w-full aspect-video">
                 <Image 
                    src={imageUrl} 
                    alt={companyData.name || 'Vista previa del menú'}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="p-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">{companyData.name}</h1>
                <p className="text-lg text-gray-600 mb-6">{companyData.customShareMessage || '¡Descubre nuestro delicioso menú!'}</p>
                <a 
                    href={menuUrl}
                    className="inline-block bg-primary text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-primary/90 transition-transform hover:scale-105"
                >
                    Ver Menú Completo
                </a>
            </div>
        </div>
        <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Powered by <a href="https://websap.site" className="font-bold text-primary">WebSapMax</a></p>
        </footer>
    </div>
  );
}
