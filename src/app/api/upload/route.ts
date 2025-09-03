// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Usamos la instancia de cliente, pero para el SDK de Admin sería mejor.
import formidable from 'formidable';
import fs from 'fs';
import { getAuth } from 'firebase/auth';

const storage = getStorage(app);

// Helper para parsear el form
const formidableParse = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req as any, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            resolve({ fields, files });
        });
    });
};

export async function POST(req: NextRequest) {
    try {
        const { files, fields } = await formidableParse(req);
        
        const file = files.file?.[0];
        const path = fields.path?.[0] || 'uploads/';

        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
        }
        
        // Crear un nombre de archivo único para evitar sobreescrituras
        const uniqueFileName = `${Date.now()}-${file.originalFilename?.replace(/[^a-z0-9._-]/gi, '_')}`;
        const storageRef = ref(storage, `${path}${uniqueFileName}`);
        
        // Leer el archivo temporal y subirlo a Firebase Storage
        const fileBuffer = fs.readFileSync(file.filepath);
        const snapshot = await uploadBytes(storageRef, fileBuffer, { contentType: file.mimetype || 'application/octet-stream' });
        const downloadURL = await getDownloadURL(snapshot.ref);

        return NextResponse.json({ url: downloadURL }, { status: 200 });

    } catch (error) {
        console.error('Error en /api/upload:', error);
        return NextResponse.json({ error: 'Error al subir el archivo.', details: (error as Error).message }, { status: 500 });
    }
}
