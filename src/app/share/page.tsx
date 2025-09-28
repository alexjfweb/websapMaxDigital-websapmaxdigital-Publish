// src/app/share/page.tsx
// NOTA: Este archivo ahora maneja la ruta /share?company=...&image=...
// y genera la página intermedia con las metaetiquetas correctas.

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { firebaseConfig } from '@/lib/firebase-config';


const BUCKET_NAME = 'websapmax-images';

// El tipo Props ahora se enfoca en los searchParams
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const companyId = searchParams.company as string;
  const imagePath = searchParams.image as string;

  if (!companyId || !imagePath) {
    return {
      title: 'WebSapMax',
      description: '¡Descubre nuestro delicioso menú!',
    };
  }

  const db = getDb();
  const companyRef = doc(db, 'companies', companyId);
  const companySnap = await getDoc(companyRef);

  let companyName = "Menú Digital";
  let companyDescription = "¡Haz clic para ver nuestras delicias!";

  if (companySnap.exists()) {
    const companyData = companySnap.data();
    companyName = companyData.name || companyName;
    companyDescription = companyData.customShareMessage || companyData.description || companyDescription;
  }
  
  // Construcción de la URL de la imagen y del menú
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${decodeURIComponent(imagePath)}`;
  const menuUrl = `https://www.websap.site/menu/${companyId}`;

  return {
    title: companyName,
    description: companyDescription,
    openGraph: {
      title: companyName,
      description: companyDescription,
      url: menuUrl,
      type: 'website',
      siteName: 'WebSapMax',
      locale: 'es_ES',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: `Vista previa del menú de ${companyName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: companyName,
      description: companyDescription,
      images: [imageUrl],
    },
    other: {
      'fb:app_id': firebaseConfig.appId,
    },
    alternates: {
      canonical: menuUrl,
    },
  };
}

// El componente ahora renderiza la página intermedia
export default async function SharePage({ searchParams }: Props) {
  const companyId = searchParams.company as string;
  const imagePath = searchParams.image as string;

  if (!companyId || !imagePath) {
    return notFound();
  }
  
  const db = getDb();
  const companySnap = await getDoc(doc(db, 'companies', companyId));

  if (!companySnap.exists()) {
    return notFound();
  }
  
  const companyData = companySnap.data();
  const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/share-images/${companyId}/${decodeURIComponent(imagePath)}`;
  const menuUrl = `/menu/${companyId}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white">
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
            href={`https://www.websap.site${menuUrl}`}
            className="inline-block bg-primary text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-primary/90 transition-transform hover:scale-105"
          >
            Ver Menú Completo
          </a>
        </div>
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by <a href="https://www.websap.site" className="font-bold text-primary">WebSapMax</a></p>
      </footer>
    </div>
  );
}
