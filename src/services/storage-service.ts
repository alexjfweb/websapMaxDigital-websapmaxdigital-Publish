// src/services/storage-service.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

const storage = getStorage(app);

class StorageService {
  /**
   * Comprime y sube un archivo a un endpoint de la API.
   * @param file El archivo original a subir.
   * @param path La ruta en Storage donde se guardará el archivo (enviada a la API).
   * @returns La URL de descarga pública del archivo.
   */
  async compressAndUploadFile(file: File, path: string): Promise<string> {
    if (!file) {
      throw new Error("No se proporcionó ningún archivo para subir.");
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };

    console.log(`Comprimiendo imagen: ${file.name}, tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Imagen comprimida: ${compressedFile.name}, nuevo tamaño: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Ahora, en lugar de subir directamente, llamamos a la API
    return this.uploadFile(compressedFile, path);
  }
  
  /**
   * Sube un archivo a Firebase Storage a través de un endpoint de API.
   * @param file El archivo a subir.
   * @param path La ruta donde se guardará (actualmente no usada por la API, pero podría ser útil).
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el archivo a la API.');
      }
      
      // Devolver la URL recibida desde la API
      return result.url;

    } catch (error: any) {
      console.error("❌ Error al llamar a la API de subida:", error);
      throw new Error(error.message || "No se pudo subir el archivo.");
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