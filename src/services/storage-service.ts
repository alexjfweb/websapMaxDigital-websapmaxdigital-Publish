
// src/services/storage-service.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { menuImagesStorage } from '@/lib/firebase'; // Importar el bucket específico para imágenes

/**
 * Sube un archivo a una ruta específica en el bucket de imágenes del menú.
 * 
 * @param file El archivo a subir.
 * @param path La ruta dentro del bucket donde se guardará (ej. 'dishes/').
 * @returns Una promesa que se resuelve con la URL pública de la imagen subida.
 */
const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo para subir.");
  }

  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fullPath = `${path}${timestamp}-${sanitizedFileName}`;
  
  const imageRef = ref(menuImagesStorage, fullPath);

  try {
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    throw new Error('No se pudo subir la imagen a Cloud Storage.');
  }
};

/**
 * Elimina un archivo de Cloud Storage usando su URL pública.
 * 
 * @param fileUrl La URL completa del archivo a eliminar.
 */
const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl.startsWith('https://firebasestorage.googleapis.com')) {
    console.warn(`[storage-service] La URL "${fileUrl}" no parece ser una URL de Firebase Storage. Se omitirá la eliminación.`);
    return;
  }
  
  try {
    const fileRef = ref(menuImagesStorage, fileUrl);
    await deleteObject(fileRef);
  } catch (error: any) {
    // Es común que el archivo no exista si ya fue borrado, así que no tratamos "object-not-found" como un error fatal.
    if (error.code === 'storage/object-not-found') {
      console.log(`[storage-service] El archivo a eliminar no fue encontrado (es posible que ya haya sido borrado): ${fileUrl}`);
    } else {
      console.error(`[storage-service] Error al eliminar el archivo: ${fileUrl}`, error);
      // No relanzamos el error para no interrumpir flujos de actualización si solo falla el borrado del archivo antiguo.
    }
  }
};

export const storageService = {
  uploadFile,
  deleteFile
};
