
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Asegúrate que tu firebase init esté aquí
import formidable, { File } from 'formidable';
import fs from 'fs/promises';

// Deshabilitar el bodyParser de Next.js para esta ruta
export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = getStorage(app);

const parseForm = (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req as any, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseForm(request);
    
    const file = files.file?.[0] as File | undefined;
    const path = fields.path?.[0] as string | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
    }
    
    if (!path) {
      return NextResponse.json({ error: 'La ruta de destino es requerida.' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(file.filepath);
    const uniqueFileName = `${Date.now()}-${file.originalFilename?.replace(/[^a-z0-9._-]/gi, '_')}`;
    const storageRef = ref(storage, `${path}${uniqueFileName}`);

    // Subir el buffer del archivo
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url: downloadURL }, { status: 200 });

  } catch (e: any) {
    console.error('Error en la API de subida:', e);
    return NextResponse.json({ error: `Error interno del servidor: ${e.message}` }, { status: 500 });
  }
}
