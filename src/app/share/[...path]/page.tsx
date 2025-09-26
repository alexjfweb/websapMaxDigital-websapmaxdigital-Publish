import { redirect } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: { path: string[] };
};

// Esta función genera los metadatos para las vistas previas en redes sociales.
// Los rastreadores de WhatsApp/Facebook la leen antes de intentar renderizar la página.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // path: ['share-images', 'COMPANY_ID', 'image.jpg']
  if (!params.path || params.path.length < 3) {
    return { title: 'Menú Digital' };
  }

  const imagePath = params.path.join('/');
  const menuId = params.path[1]; // El ID de la compañía es el segundo segmento

  // URL pública de la imagen en Google Storage
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;

  // URL del menú al que se redirigirá
  const menuUrl = `/menu/${menuId}`;

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

// Este es el componente que se ejecuta cuando un USUARIO visita la URL.
// No renderiza nada, solo redirige.
export default function SharePage({ params }: Props) {
  // path: ['share-images', 'COMPANY_ID', 'image.jpg']
  if (!params.path || params.path.length < 2) {
    // Si la ruta no es válida, redirige a la página principal por seguridad.
    redirect('/');
  }

  const menuId = params.path[1]; // El ID de la compañía es el segundo segmento
  
  // Redirige al usuario directamente al menú del restaurante.
  redirect(`/menu/${menuId}`);

  // No se devuelve ningún JSX, Next.js manejará la redirección.
  return null;
}
