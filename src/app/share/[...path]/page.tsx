
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, firebaseConfig } from '@/lib/firebase'; // Importar firebaseConfig
import { notFound } from 'next/navigation';
import Image from 'next/image';

const BUCKET_NAME = 'websapmax-images';

type Props = {
  params: { path: string[] };
};

// Esta página ahora servirá como la página de aterrizaje para los enlaces compartidos
// y generará los metadatos correctos para las vistas previas.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;
  
  if (pathParts.length < 2) {
    console.warn("[Share Metadata] Path inválido, no se pudo extraer companyId/imageName.");
    return { title: 'WebSapMax' };
  }

  const companyId = pathParts[0]; 
  const imagePath = pathParts.slice(1).join('/');
  
  const db = getDb();
  const companyRef = doc(db, 'companies', companyId);
  const companySnap = await getDoc(companyRef);
  
  let companyName = "Menú Digital";
  let companyDescription = "¡Descubre nuestro delicioso menú!";

  if (companySnap.exists()) {
      const companyData = companySnap.data();
      companyName = companyData.name || companyName;
      companyDescription = companyData.customShareMessage || companyData.description || companyDescription;
  }
  
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${imagePath}`;
  const menuUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://websap.site'}/menu/${companyId}`;
  
  return {
    title: companyName,
    description: companyDescription,
    openGraph: {
      title: companyName,
      description: companyDescription,
      url: menuUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Menú de ${companyName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: companyName,
      description: companyDescription,
      images: [imageUrl],
    },
    // Añadir el fb:app_id
    other: {
        'fb:app_id': firebaseConfig.appId,
    }
  };
}

// El componente ahora renderiza una página en lugar de redirigir.
export default async function SharePage({ params }: Props) {
  const pathParts = params.path;

  if (pathParts.length < 2) {
    return notFound();
  }

  const companyId = pathParts[0];
  const imagePath = pathParts.slice(1).join('/');
  
  const db = getDb();
  const companySnap = await getDoc(doc(db, 'companies', companyId));

  if (!companySnap.exists()) {
    return notFound();
  }
  
  const companyData = companySnap.data();
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${imagePath}`;
  const menuUrl = `/menu/${companyId}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div 
            className="w-full max-w-xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white"
        >
            <div className="relative w-full aspect-video">
                 <Image 
                    src={imageUrl} 
                    alt={companyData.name || 'Vista previa del menú'}
                    fill
                    className="object-cover"
                    priority
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
