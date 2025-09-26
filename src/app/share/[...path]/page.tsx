
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1]; // El ID del restaurante está en la segunda parte de la ruta.
  
  return {
    title: 'Menú Digital QR',
    description: 'Descubre nuestro delicioso menú',
    openGraph: {
      title: 'Menú Digital QR',
      description: 'Descubre nuestro delicioso menú',
      url: `https://websap.site/menu/${menuId}`, // URL canónica a la que se redirige
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Vista previa del Menú Digital',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Menú Digital QR',
      description: 'Descubre nuestro delicioso menú',
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }: Props) {
  // La ruta es como ['share-images', 'COMPANY_ID', 'image-name.jpg']
  // El ID del menú es el segundo elemento del path.
  const menuId = params.path[1];
  
  // Redirige al usuario directamente al menú del restaurante.
  // Los rastreadores de redes sociales leerán los metadatos antes de seguir la redirección.
  redirect(`/menu/${menuId}`);
}
