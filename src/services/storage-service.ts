// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen en el cliente y la sube al servidor a través de un endpoint de API.
 * @param file El archivo de imagen a subir.
 * @param path La ruta de destino en el bucket (ej. 'landing-images').
 * @returns Una promesa que se resuelve con la URL pública de la imagen subida.
 */
const compressAndUploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo.");
  }

  // Opciones de compresión
  const options = {
    maxSizeMB: 0.8, // Límite de 800KB, como se especificó
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error en el servidor al subir la imagen.');
    }
    
    return result.url;

  } catch (error) {
    console.error('Error durante la compresión y subida:', error);
    throw new Error('No se pudo procesar y subir la imagen.');
  }
};


/**
 * Elimina un archivo de Cloud Storage usando su URL pública.
 * Esta función sigue siendo relevante si se necesita borrar archivos antiguos.
 * @param fileUrl La URL completa del archivo a eliminar.
 */
const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !fileUrl.startsWith('https://storage.googleapis.com')) {
    console.warn(`[storage-service] La URL "${fileUrl}" no parece ser una URL de Firebase Storage. Se omitirá la eliminación.`);
    return;
  }
  
  // La lógica de eliminación del lado del servidor se podría implementar en un endpoint de API si fuera necesario.
  // Por ahora, esta función queda como placeholder o para ser usada si se implementa un endpoint de borrado.
  console.log(`[storage-service] Se solicitó eliminar: ${fileUrl}. Esta operación debe ser manejada por el backend.`);
};

export const storageService = {
  compressAndUploadFile,
  deleteFile,
  // Se eliminan las funciones que dependían de `firebase-admin` en el cliente.
};
