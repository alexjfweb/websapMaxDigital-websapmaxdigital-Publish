
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';

type Props = {
  params: { path: string[] };
};

// Genera los metadatos para la vista previa en redes sociales
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathParts = params.path;

  if (pathParts.length < 3 || pathParts[0] !== 'restaurant') {
    // Fallback si la URL no tiene el formato esperado
    return {
      title: 'Menú Digital QR',
      description: 'Descubre nuestro delicioso menú',
    };
  }

  const menuId = pathParts[1];
  const imageName = pathParts[2];
  
  // Construye la URL de la imagen en base a la convención de almacenamiento
  const imageUrl = `https://storage.googleapis.com/websapmax-images/share-images/${menuId}/${imageName}`;
  const menuUrl = `https://websap.site/menu/${menuId}`;
  
  return {
    title: 'Menú Digital QR',
    description: '¡Descubre nuestro delicioso menú!',
    openGraph: {
      title: 'Menú Digital QR',
      description: '¡Descubre nuestro delicioso menú!',
      url: menuUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Vista previa del menú',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Menú Digital QR',
      description: '¡Descubre nuestro delicioso menú!',
      images: [imageUrl],
    },
  };
}

// Este componente solo se ejecuta en el servidor y redirige inmediatamente
export default function SharePage({ params }: Props) {
  const pathParts = params.path;

  if (pathParts.length < 2 || pathParts[0] !== 'restaurant') {
    // Si la URL no es válida, redirige a la página principal
    redirect('/');
  }

  const menuId = pathParts[1];
  redirect(`/menu/${menuId}`);

  // No se renderiza ningún JSX. La redirección es inmediata.
}

    