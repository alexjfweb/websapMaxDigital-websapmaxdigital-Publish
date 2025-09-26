
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { notFound } from 'next/navigation';

const BUCKET_NAME = 'websapmax-images';

type Props = {
  params: { path: string[] };
};

// Esta página está dedicada a la REDIRECCIÓN DIRECTA (Botón Verde)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;
  
  if (pathParts.length < 2) {
    console.warn("[Share Metadata] Path inválido, no se pudo extraer companyId/imageName.");
    return { title: 'WebSapMax' };
  }

  // Asumimos que la ruta es como /share/share-images/companyId/filename.jpg
  // El path sería: ['share-images', 'companyId', 'filename.jpg']
  const companyId = pathParts[1]; 
  
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
  
  // Construye la URL pública y directa a la imagen en Google Cloud Storage
  const imagePath = pathParts.join('/');
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${imagePath}`;
  
  // La URL canónica que queremos que se muestre es la del menú
  const menuUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://websap.site'}/menu/${companyId}`;
  
  return {
    title: companyName,
    description: companyDescription,
    openGraph: {
      title: companyName,
      description: companyDescription,
      url: menuUrl, // URL a la que se debería ir al final
      images: [
        {
          url: imageUrl, // URL directa de la imagen para que el bot la lea
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
  };
}

export default function SharePage({ params }: Props) {
  const pathParts = params.path;

  // Validar la estructura de la ruta
  // Esperamos algo como: ['share-images', 'W1ESd...', '1758...jpg']
  if (pathParts.length < 2) {
    console.warn(`[Share Page] Redirección fallida: path inválido. Redirigiendo a home.`);
    redirect('/');
  }

  const companyId = pathParts[1];
  redirect(`/menu/${companyId}`);
}
