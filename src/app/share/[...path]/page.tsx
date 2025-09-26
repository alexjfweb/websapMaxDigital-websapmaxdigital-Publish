
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // La nueva estructura es: /share/restaurant/{companyId}/{imageName}
  // params.path será: ['restaurant', 'companyId', 'imageName.jpg']
  if (!params.path || params.path.length < 3) {
    return { title: 'Menú Digital' };
  }

  const restaurantId = params.path[1];
  const imageName = params.path[2];

  // La imagen se encuentra en la subcarpeta del companyId
  const imageUrl = `https://storage.googleapis.com/websapmax-images/share-images/${restaurantId}/${imageName}`;
  const menuUrl = `/menu/${restaurantId}`;

  return {
    title: 'Menú Digital QR',
    description: '¡Mira nuestro delicioso menú! 🍽️🥘🍽️',
    openGraph: {
      title: 'Menú Digital QR',
      description: '¡Mira nuestro delicioso menú! 🍽️🥘🍽️',
      url: menuUrl,
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
  // La nueva estructura es: /share/restaurant/{companyId}/{imageName}
  if (!params.path || params.path.length < 3) {
    redirect('/');
  }

  const restaurantId = params.path[1]; // Extraemos el ID del restaurante
  
  // Redirige al usuario directamente al menú del restaurante.
  redirect(`/menu/${restaurantId}`);

  // No se devuelve ningún JSX, Next.js manejará la redirección del servidor.
  return null;
}
