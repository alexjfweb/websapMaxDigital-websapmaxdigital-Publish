
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const BUCKET_NAME = 'websapmax-images';

type Props = {
  params: { path: string[] };
};

// Esta página está dedicada a la REDIRECCIÓN DIRECTA (Botón Verde)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;

  // Validación básica del path
  if (pathParts.length === 0) {
    return { title: 'WebSapMax' };
  }

  // Se asume que el ID del restaurante es el primer elemento relevante para encontrar la info.
  // La lógica para extraer el ID puede necesitar ajustarse si la estructura de URL cambia.
  const companyId = pathParts.find(p => p.length > 15) || pathParts[0]; // Heurística simple
  
  const db = getDb();
  const companyRef = doc(db, 'companies', companyId);
  const companySnap = await getDoc(companyRef);
  
  let companyName = "Menú Digital";
  let companyDescription = "¡Descubre nuestro delicioso menú!";

  if (companySnap.exists()) {
      const companyData = companySnap.data();
      companyName = companyData.name || companyName;
      companyDescription = companyData.description || companyDescription;
  }
  
  // Construye la URL de la imagen directamente al bucket de GCS
  const imagePath = pathParts.join('/');
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${imagePath}`;
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
  };
}

export default function SharePage({ params }: Props) {
  const pathParts = params.path;

  if (pathParts.length < 2 || pathParts[0] !== 'share-images') {
    redirect('/');
  }

  const menuId = pathParts[1];
  redirect(`/menu/${menuId}`);
}
