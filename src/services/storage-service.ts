
// src/services/storage-service.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime y sube un archivo a Firebase Storage directamente desde el cliente.
   * Si el archivo no es una imagen válida, retorna null.
   * @param file El archivo original a subir. Puede ser File, null, o undefined.
   * @param path La ruta en Storage donde se guardará el archivo.
   * @returns La URL de descarga pública del archivo o null si la entrada no es válida.
   */
  async compressAndUploadFile(file: File | null | undefined, path: string): Promise<string | null> {
    // --- VALIDACIÓN DE ENTRADA ---
    // Si no se proporciona un archivo o no es una instancia de File, no se hace nada.
    if (!(file instanceof File)) {
      console.log("No se proporcionó un archivo de imagen válido para subir. Se omitirá la subida.");
      return null;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };

    try {
        console.log(`Comprimiendo imagen: ${file.name}, tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Imagen comprimida: ${compressedFile.name}, nuevo tamaño: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Sube el archivo comprimido directamente
        return await this.uploadFile(compressedFile, path);
    } catch (error) {
        console.error("Error durante la compresión, intentando subir original...", error);
        // Si la compresión falla, intenta subir el archivo original
        return await this.uploadFile(file, path);
    }
  }
  
  /**
   * Sube un archivo a Firebase Storage.
   * @param file El archivo a subir.
   * @param path La ruta donde se guardará el archivo.
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const sanitizedFileName = file.name.replace(/[^a-z0-9._-]/gi, '_');
      const fullPath = `${path}${Date.now()}-${sanitizedFileName}`;
      const storageRef = ref(storage, fullPath);
      
      console.log(`Subiendo archivo a: ${fullPath}`);
      const snapshot = await uploadBytes(storageRef, file);
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
