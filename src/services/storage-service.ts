
// src/services/storage-service.ts - CON COMPRESIÓN INTELIGENTE y API de subida
import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen en el cliente y luego la sube a través de la API del servidor.
 * 
 * @param file El archivo de imagen a procesar.
 * @param path La ruta dentro del bucket donde se guardará (ej. 'landing-images').
 * @returns Una promesa que se resuelve con la URL pública de la imagen subida.
 */
const compressAndUploadFile = async (file: File, path: string): Promise<string> => {
  const options = {
    maxSizeMB: 0.8, // 800KB, para ser seguro
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)}KB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Tamaño comprimido: ${(compressedFile.size / 1024).toFixed(2)}KB`);

    const formData = new FormData();
    formData.append('file', compressedFile, file.name); // Enviar el archivo comprimido pero con el nombre original
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error en la API de subida');
    }

    return result.url;

  } catch (error) {
    console.error('Error durante la compresión y subida:', error);
    throw error;
  }
};


// Función para eliminar un archivo. Requiere una implementación de API si se necesita desde el cliente
// Por ahora, se asume que la lógica que elimina archivos (ej. en un update) se hace en el backend.
const deleteFile = async (fileUrl: string): Promise<void> => {
    // Esta función está intencionadamente vacía en el cliente.
    // La eliminación debe ser manejada por una API segura en el backend
    // para evitar que cualquier usuario pueda borrar archivos.
    console.warn(`[storage-service] La eliminación de archivos desde el cliente no está implementada por seguridad. URL: ${fileUrl}`);
    return Promise.resolve();
};

export const storageService = {
  compressAndUploadFile,
  deleteFile
};
