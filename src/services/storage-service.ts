
// src/services/storage-service.ts - CORREGIDO para exportar funciones directamente

import imageCompression from 'browser-image-compression';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

// Función para comprimir imagen
const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 800, 
      useWebWorker: true,
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Imagen comprimida a ${(compressedFile.size / 1024).toFixed(2)}KB`);
      return compressedFile;
    } catch (error) {
      console.error("Error en la compresión, usando archivo original:", error);
      return file;
    }
};

// Función principal CORREGIDA - Convierte a Base64 en lugar de subir
const compressAndConvertToBase64 = async (file: File): Promise<string> => {
    try {
      console.log('🚀 Iniciando proceso de compresión y conversión a Base64...');
      
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

    } catch (error: any) {
      console.error('❌ Error en compressAndConvertToBase64:', error);
      throw new Error(`Error al procesar la imagen: ${error.message}`);
    }
};

// Función para subir a Firebase Storage (ahora obsoleta en el flujo principal, pero mantenida)
const uploadFile = async (file: File, path: string): Promise<string> => {
    console.warn("uploadFile a API está en desuso. Usando conversión a Base64.");
    return compressAndConvertToBase64(file);
};

// Función para eliminar archivo de Firebase Storage
const deleteFile = async (fileUrl: string): Promise<void> => {
    if (fileUrl && fileUrl.startsWith('https://storage.googleapis.com')) {
         console.log(`(Simulado) La eliminación de ${fileUrl} debe implementarse en el servidor si se requiere.`);
    }
    return Promise.resolve();
};

// Se exportan directamente las funciones que se necesitan en la aplicación
export const storageService = {
  compressAndUploadFile: compressAndConvertToBase64, // Ahora apunta a la función de conversión a Base64
  uploadFile,
  deleteFile
};
