
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen en el cliente y la sube al servidor a través de un endpoint de API.
 * @param file El archivo de imagen a subir.
 * @param path La ruta de destino en el bucket (ej. 'landing-images').
 * @returns Una promesa que se resuelve con la URL pública directa de la imagen subida desde Google Cloud Storage.
 */
const compressAndUploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo.");
  }

  // Opciones de compresión (ligeras, para optimizar la carga sin perder demasiada calidad)
  const options = {
    maxSizeMB: 1, // Límite generoso de 1MB para la compresión
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    const formData = new FormData();
    formData.append('file', compressedFile, file.name); // Incluir el nombre original
    formData.append('path', path);

    // Única responsabilidad: Enviar el archivo a la API del servidor.
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error en el servidor al subir la imagen.');
    }
    
    // 🔥 CAMBIO CRÍTICO: Devolver la URL directa del bucket, tal como la entrega la API.
    return result.url;

  } catch (error) {
    console.error('Error durante la compresión y subida:', error);
    throw error; // Relanzar el error para que el componente que llama pueda manejarlo
  }
};


/**
 * Elimina un archivo de Cloud Storage usando su URL pública.
 * Esta función queda como placeholder, ya que la eliminación segura debe manejarse en el backend.
 * @param fileUrl La URL completa del archivo a eliminar.
 */
const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl || !fileUrl.startsWith('https://storage.googleapis.com')) {
    console.warn(`[storage-service] La URL proporcionada no es válida para eliminación. Se omitirá la acción.`);
    return;
  }
  
  console.log(`[storage-service] Se solicitó eliminar: ${fileUrl}. Esta operación debe ser manejada por un endpoint de API seguro en el backend.`);
  // En una implementación real, aquí se llamaría a `fetch('/api/delete-file', { method: 'POST', body: JSON.stringify({ url: fileUrl }) })`
};

export const storageService = {
  compressAndUploadFile,
  deleteFile,
};

