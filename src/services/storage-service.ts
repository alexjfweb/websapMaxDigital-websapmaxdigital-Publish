
// src/services/storage-service.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime y sube un archivo a Firebase Storage.
   * Si el archivo no es una imagen, intenta subirlo directamente.
   * @param file El archivo a subir.
   * @param path La ruta en Storage donde se guardará.
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error("Se esperaba un objeto de tipo File para subir.");
    }

    let fileToUpload = file;
    
    // Intenta comprimir solo si es una imagen
    if (file.type.startsWith('image/')) {
        try {
            console.log(`Comprimiendo imagen: ${file.name}, tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1080,
                useWebWorker: true,
            };
            fileToUpload = await imageCompression(file, options);
            console.log(`Imagen comprimida: ${fileToUpload.name}, nuevo tamaño: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (error) {
            console.warn("No se pudo comprimir la imagen, se subirá el archivo original.", error);
        }
    }

    try {
      const sanitizedFileName = fileToUpload.name.replace(/[^a-z0-9._-]/gi, '_');
      const fullPath = `${path}${Date.now()}-${sanitizedFileName}`;
      const storageRef = ref(storage, fullPath);
      
      console.log(`Subiendo archivo a: ${fullPath}`);
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`✅ Archivo subido exitosamente. URL: ${downloadURL}`);
      return downloadURL;

    } catch (error: any) {
      console.error("❌ Error al subir el archivo a Firebase Storage:", error);
      
      if (error.serverResponse) {
        console.error("Respuesta del servidor de Firebase:", error.serverResponse);
      }
      
      throw new Error(`Error al subir: ${error.code || error.message}`);
    }
  }

  /**
   * Elimina un archivo de Firebase Storage a partir de su URL.
   * @param fileUrl La URL del archivo a eliminar.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      console.warn("No se proporcionó URL para eliminar archivo. No se hizo nada.");
      return;
    }
    
    if (fileUrl.includes('placehold.co')) {
        console.log("No se elimina la imagen de placeholder.");
        return;
    }

    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      console.log(`✅ Archivo eliminado exitosamente de: ${fileUrl}`);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`⚠️ No se encontró el archivo para eliminar en: ${fileUrl}. Puede que ya haya sido eliminado o nunca existió.`);
      } else {
        console.error("❌ Error al eliminar el archivo de Firebase Storage:", error);
        throw new Error("No se pudo eliminar el archivo.");
      }
    }
  }
}

export const storageService = new StorageService();
