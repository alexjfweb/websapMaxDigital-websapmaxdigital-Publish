
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // La ruta del archivo en GCS. Ejemplo: 'share-images/W1ESdg2NMcXL1BeufLX8/image.jpg'
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  
  // Extraer el restaurantId de la ruta. Es el segundo segmento.
  // path[0] = 'share-images', path[1] = 'W1ESdg2NMcXL1BeufLX8', path[2] = 'filename.jpg'
  const restaurantId = params.path.length > 1 ? params.path[1] : '';

  return {
    title: '¡Mira nuestro delicioso menú! 🍽️',
    description: 'Descubre todos nuestros platillos especiales y haz tu pedido.',
    openGraph: {
      title: '¡Mira nuestro delicioso menú! 🍽️',
      description: 'Descubre todos nuestros platillos especiales y haz tu pedido.',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      url: restaurantId ? `/menu/${restaurantId}` : '/', // URL canónica
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '¡Mira nuestro delicioso menú! 🍽️',
      description: 'Descubre todos nuestros platillos especiales.',
      images: [imageUrl],
    },
  };
}

// Este componente ahora se encarga de la redirección
export default function SharePage({ params }: Props) {
  // Extraemos el ID del restaurante de la ruta.
  // La ruta viene como un array: ['share-images', 'W1ESdg2NMcXL1BeufLX8', 'nombre-archivo.jpg']
  const restaurantId = params.path.length > 1 ? params.path[1] : null;

  if (restaurantId) {
    // Redirigimos al usuario a la página del menú real.
    redirect(`/menu/${restaurantId}`);
  } else {
    // Si por alguna razón no hay ID, redirigimos a la página principal.
    redirect('/');
  }
  
  // No se renderiza nada, la redirección se encarga de todo.
  return null;
}
