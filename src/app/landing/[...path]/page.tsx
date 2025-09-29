
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;
  
  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    return { title: 'WebSapMax' };
  }

  const companyId = pathParts[1];
  const imageName = pathParts.length > 2 ? pathParts[2] : null;

  let companyName = "Menú Digital";
  let companyDescription = "¡Haz clic para ver nuestras delicias!";
  let finalImageUrl: string | null = null;
  
  try {
      const db = getDb();
      const companySnap = await getDoc(doc(db, 'companies', companyId));
      if (companySnap.exists()) {
          const companyData = companySnap.data();
          companyName = companyData.name || companyName;
          companyDescription = companyData.customShareMessage || companyData.description || companyDescription;
          
          // Usa la imagen de la URL o la imagen custom de la compañía como fallback
          const effectiveImageName = imageName || companyData.customShareImageUrl?.split('/').pop()?.split('?')[0];
          
          if (effectiveImageName) {
            // Apunta directamente a la URL de Google Cloud Storage
            finalImageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${decodeURIComponent(effectiveImageName)}`;
          } else {
            finalImageUrl = companyData.logoUrl || "https://placehold.co/1200x630.png?text=WebSapMax";
          }
      } else {
        // Si no existe la compañía, usa el placeholder como fallback
        finalImageUrl = "https://placehold.co/1200x630.png?text=WebSapMax";
      }
  } catch (e) {
      console.error("Error fetching metadata:", e);
      // En caso de error, usa el placeholder como fallback
      finalImageUrl = "https://placehold.co/1200x630.png?text=WebSapMax";
  }
  
  const menuUrl = `https://www.websap.site/menu/${companyId}`;
  
  return {
    title: escapeHtml(companyName),
    description: escapeHtml(companyDescription),
    openGraph: {
      title: escapeHtml(companyName),
      description: escapeHtml(companyDescription),
      url: menuUrl,
      images: finalImageUrl ? [finalImageUrl] : ["https://placehold.co/1200x630.png?text=WebSapMax"], // Fallback garantizado
      type: 'website',
      siteName: 'WebSapMax',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: escapeHtml(companyName),
      description: escapeHtml(companyDescription),
      images: finalImageUrl ? [finalImageUrl] : ["https://placehold.co/1200x630.png?text=WebSapMax"], // Fallback garantizado
    },
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
  const imageName = pathParts.length > 2 ? pathParts[2] : companyData.customShareImageUrl?.split('/').pop()?.split('?')[0];
  const imageUrl = imageName
    ? `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${decodeURIComponent(imageName)}`
    : companyData.logoUrl || "https://placehold.co/1200x630.png?text=WebSapMax";

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
