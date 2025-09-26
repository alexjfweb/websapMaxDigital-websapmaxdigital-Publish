
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

type Props = {
  params: { path: string[] };
};

// Esta página está dedicada a la REDIRECCIÓN DIRECTA (Botón Verde)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;

  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    return { title: 'WebSapMax' };
  }

  const companyId = pathParts[1];
  const db = getDb();
  const companyRef = doc(db, 'companies', companyId);
  const companySnap = await getDoc(companyRef);
  
  let imageUrl = 'https://websap.site/imagen/carracteristica-QE-AJ.png';
  if (companySnap.exists()) {
      const companyData = companySnap.data();
      // Usa el banner o el logo como imagen de vista previa
      imageUrl = companyData.bannerUrl || companyData.logoUrl || imageUrl;
  }
  
  return {
    title: "Menú Digital",
    description: "¡Descubre nuestro delicioso menú!",
    openGraph: {
      title: "Menú Digital",
      description: "¡Haz clic para ver nuestras delicias!",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://websap.site'}/menu/${companyId}`,
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

export default function SharePage({ params }: Props) {
  const pathParts = params.path;

  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    redirect('/');
  }

  const menuId = pathParts[1];
  redirect(`/menu/${menuId}`);
}
