
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { notFound } from 'next/navigation';

type Props = {
  params: { path: string[] };
};

// Esta página está dedicada a la PÁGINA INTERMEDIA (Botón Azul)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;
  
  if (pathParts.length < 3 || pathParts[0] !== 'restaurant') {
    return { title: 'WebSapMax' };
  }

  const companyId = pathParts[1];
  const imageName = pathParts[2];
  
  // La URL de la imagen debe apuntar a la ubicación pública y directa en GCS
  const imageUrl = `https://storage.googleapis.com/websapmax-images/share-images/${companyId}/${imageName}`;
  const menuUrl = `https://www.websap.site/menu/${companyId}`;
  
  return {
    title: "Menú Digital - Vista Previa",
    description: "¡Haz clic para ver nuestras delicias!",
    openGraph: {
      title: "Menú Digital",
      description: "¡Haz clic para ver nuestras delicias!",
      url: menuUrl,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "Menú Digital",
      description: "¡Haz clic para ver nuestras delicias!",
      images: [imageUrl],
    },
  };
}

export default async function LandingSharePage({ params }: Props) {
  const pathParts = params.path;

  // Validamos que la URL tenga la estructura correcta
  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    return notFound();
  }

  const companyId = pathParts[1];
  const imageName = pathParts.length > 2 ? pathParts[2] : null;

  const db = getDb();
  const companySnap = await getDoc(doc(db, 'companies', companyId));

  if (!companySnap.exists()) {
    return notFound();
  }

  const companyData = companySnap.data();
  // La URL de la imagen debe ser la de GCS, y solo si se proporciona
  const imageUrl = imageName
    ? `https://storage.googleapis.com/websapmax-images/share-images/${companyId}/${decodeURIComponent(imageName)}`
    : companyData.logoUrl || "https://placehold.co/1200x630.png?text=WebSapMax";

  // CORRECCIÓN: La URL del menú debe usar el dominio de producción con 'www'
  const menuUrl = `https://www.websap.site/menu/${companyId}`;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div 
            className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white"
        >
            <div className="relative w-full aspect-[16/9]">
                 <img 
                    src={imageUrl} 
                    alt={companyData.name || 'Vista previa del menú'}
                    className="w-full h-full object-cover"
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
