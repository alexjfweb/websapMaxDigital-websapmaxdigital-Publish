
import { Metadata } from 'next';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1];
  
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
      description: 'Descubre todos nuestros platillos especiales.',
      images: [imageUrl],
    },
    other: {
      refresh: `2; url=/menu/${menuId}`,
    },
  };
}

export default function SharePage({ params }: Props) {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1];
  
  return (
    <>
      <meta httpEquiv="refresh" content={`2; url=/menu/${menuId}`} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-center mb-4">Menú Digital QR</h1>
          <img 
            src={imageUrl} 
            alt="Menú Digital"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg mb-4"
          />
          <p className="text-gray-600">Redirigiendo al menú...</p>
        </div>
      </div>
    </>
  );
}
