import { Metadata } from 'next';

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
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Menú Digital QR</h1>
        <img 
          src={imageUrl} 
          alt="Menú Digital"
          className="w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
