
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1]; // Asumiendo que el ID del restaurante es el segundo segmento de la ruta
  
  return {
    title: 'Menú Digital QR',
    description: '¡Mira nuestro delicioso menú! 🍽️🥘🍽️',
    openGraph: {
      title: 'Menú Digital QR',
      description: '¡Mira nuestro delicioso menú! 🍽️🥘🍽️',
      url: `https://websap.site/menu/${menuId}`,
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
      description: '¡Mira nuestro delicioso menú! 🍽️🥘🍽️',
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }: Props) {
  // La ruta es algo como /share/share-images/COMPANY_ID/image.jpg
  // El ID del menú es el segundo segmento después de 'share-images'
  const menuId = params.path[1];
  
  // Si no hay ID, redirigimos a la página principal por seguridad.
  if (!menuId) {
    redirect('/');
  }

  // Redirigimos al usuario directamente al menú del restaurante.
  redirect(`/menu/${menuId}`);

  // No se renderiza ningún HTML, Next.js maneja la redirección en el servidor.
  return null;
}
