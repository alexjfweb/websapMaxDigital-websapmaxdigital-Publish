
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  // La URL de la imagen para los metadatos debe ser la URL pública directa de Google Storage
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1];
  
  return {
    title: 'Menú Digital QR',
    description: 'Descubre nuestro delicioso menú',
    openGraph: {
      title: 'Menú Digital QR',
      description: 'Descubre nuestro delicioso menú',
      // La URL canónica a la que apunta el enlace
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
      description: 'Descubre nuestro delicioso menú',
      images: [imageUrl],
    },
  };
}

// Este componente ahora es el responsable de la redirección
export default function SharePage({ params }: Props) {
  // Extraemos el ID del restaurante de la ruta. Ej: /share/share-images/COMPANY_ID/image.jpg -> COMPANY_ID
  const menuId = params.path[1];
  
  // Si no hay ID, redirigimos a la página principal por seguridad.
  if (!menuId) {
    redirect('/');
  }

  // Redirigimos al usuario directamente al menú del restaurante.
  redirect(`/menu/${menuId}`);

  // No se renderiza ningún HTML, la redirección es del lado del servidor.
  // Next.js se encarga de servir los metadatos y luego ejecutar la redirección.
  return null;
}
