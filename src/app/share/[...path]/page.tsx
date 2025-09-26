
import { Metadata } from 'next';
import { headers } from 'next/headers';

type Props = {
  params: { path: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  
  return {
    title: 'Menú Digital QR',
    description: 'Descubre nuestro delicioso menú',
    openGraph: {
      title: 'Menú Digital QR',
      description: 'Descubre nuestro delicioso menú',
      images: [imageUrl],
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
  const imagePath = params.path.join('/');
  const imageUrl = `https://storage.googleapis.com/websapmax-images/${imagePath}`;
  const menuId = params.path[1];
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Menú Digital QR</h1>
        <img 
          src={imageUrl} 
          alt="Menú Digital"
          className="w-full max-w-md mx-auto rounded-lg shadow-lg mb-6"
        />
        <a 
          href={`/menu/${menuId}`}
          className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Ver Menú Completo
        </a>
      </div>
    </div>
  );
}
