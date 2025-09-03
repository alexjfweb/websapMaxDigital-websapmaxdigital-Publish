
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

// Esta es la nueva implementación del endpoint de subida.
// Elimina `formidable` y `fs` para trabajar directamente con los datos en memoria,
// lo que es compatible con entornos serverless y soluciona el error 504.
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const path = formData.get('path') as string || 'uploads/';

        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
        }

        // Convertir el archivo a un Buffer para subirlo
        const fileBuffer = await file.arrayBuffer();

        // Crear un nombre de archivo único para evitar sobreescrituras
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
        const storageRef = ref(storage, `${path}${uniqueFileName}`);

        // Subir el buffer a Firebase Storage
        const snapshot = await uploadBytes(storageRef, fileBuffer, { contentType: file.type || 'application/octet-stream' });
        const downloadURL = await getDownloadURL(snapshot.ref);

        return NextResponse.json({ url: downloadURL }, { status: 200 });

    } catch (error) {
        console.error('Error en /api/upload:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al subir el archivo.';
        return NextResponse.json({ error: 'Error interno del servidor al subir el archivo.', details: errorMessage }, { status: 500 });
    }
}
