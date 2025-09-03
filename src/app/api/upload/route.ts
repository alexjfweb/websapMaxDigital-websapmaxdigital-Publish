
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';

// Cargar las variables de entorno desde .env.local
dotenv.config();

// Esto solo se ejecutará en el entorno del servidor (backend)
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount: any;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Error al parsear FIREBASE_SERVICE_ACCOUNT:", e);
    serviceAccount = null;
  }
} else {
  console.error("La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.");
}

// Inicializa la app de admin de Firebase si no se ha hecho antes.
if (serviceAccount && !getApps().some(app => app.name === 'admin-sdk')) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'websapmax.appspot.com'
  }, 'admin-sdk');
}

export async function POST(req: NextRequest) {
    if (!serviceAccount) {
        return NextResponse.json({ error: 'La configuración del servicio de Firebase no está disponible.' }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const path = formData.get('path') as string || 'uploads/';

        if (!file) {
            return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
        }

        // Convertir el archivo a un Buffer para subirlo con el Admin SDK
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Usar la app de admin inicializada
        const adminApp = getApp('admin-sdk');
        const bucket = getAdminStorage(adminApp).bucket();
        
        // Crear un nombre de archivo único
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
        const fullPath = `${path}${uniqueFileName}`;

        const blob = bucket.file(fullPath);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.type,
            },
        });

        return await new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                console.error("Error en blobStream:", err);
                reject(NextResponse.json({ error: 'Error al subir el archivo.', details: err.message }, { status: 500 }));
            });

            blobStream.on('finish', async () => {
                try {
                    // Hacer el archivo público
                    await blob.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;
                    resolve(NextResponse.json({ url: publicUrl }, { status: 200 }));
                } catch (err: any) {
                     console.error("Error al hacer el archivo público:", err);
                     reject(NextResponse.json({ error: 'Error al obtener la URL del archivo.', details: err.message }, { status: 500 }));
                }
            });

            blobStream.end(fileBuffer);
        });

    } catch (error) {
        console.error('Error en /api/upload:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al subir el archivo.';
        return NextResponse.json({ error: 'Error interno del servidor al subir el archivo.', details: errorMessage }, { status: 500 });
    }
}
