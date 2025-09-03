
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin'; // Importar la instancia de admin ya inicializada

export async function POST(req: NextRequest) {
    if (!adminStorage) {
        return NextResponse.json({ error: 'La configuración del servicio de Firebase no está disponible.' }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const path = formData.get('path') as string || 'uploads/';

        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
        }

        const bucket = adminStorage.bucket();
        
        // Crear un nombre de archivo único
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
        const fullPath = `${path}${uniqueFileName}`;

        // Convertir el archivo a un Buffer para subirlo
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const blob = bucket.file(fullPath);
        
        await blob.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Hacer el archivo público para obtener la URL
        await blob.makePublic();

        const publicUrl = blob.publicUrl();

        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (error) {
        console.error('Error en /api/upload:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al subir el archivo.';
        return NextResponse.json({ error: 'Error interno del servidor al subir el archivo.', details: errorMessage }, { status: 500 });
    }
}
