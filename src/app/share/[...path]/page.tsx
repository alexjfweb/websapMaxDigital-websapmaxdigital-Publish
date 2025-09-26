import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  
  return {
    title: '¡Mira nuestro delicioso menú! 🍽️',
    description: 'Descubre todos nuestros platillos especiales y haz tu pedido.',
    openGraph: {
      title: '¡Mira nuestro delicioso menú! 🍽️',
      description: 'Descubre todos nuestros platillos especiales y haz tu pedido.',
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '¡Mira nuestro delicioso menú! 🍽️',
      description: 'Descubre nuestro delicioso menú',
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }: Props) {
  // Extrae el ID del restaurante de la ruta del archivo.
  // Asumiendo la estructura: /share/share-images/[COMPANY_ID]/[FILENAME]
  // params.path será ['share-images', 'W1ESdg2NMcXL1BeufLX8', '...']
  const menuId = params.path[1]; 
  
  if (!menuId) {
    // Si no hay ID, redirigir a la página de inicio como fallback.
    redirect('/');
  }

  // Redirección inmediata del lado del servidor al menú correspondiente.
  redirect(`/menu/${menuId}`);
  
  // No se renderiza ningún contenido visible, Next.js manejará la redirección.
  return null;
}
