
// src/services/storage-service.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '@/lib/firebase';

const storage = getStorage(app);

class StorageService {
  /**
   * Sube un archivo a Firebase Storage.
   * @param file El archivo a subir.
   * @param path La ruta en Storage donde se guardará el archivo (ej. 'dishes/').
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!file) {
      throw new Error("No se proporcionó ningún archivo para subir.");
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const fileRef = ref(storage, `${path}${fileName}`);
    
    try {
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`✅ Archivo subido exitosamente a: ${downloadURL}`);
      return downloadURL;
    } catch (error: any) {
      console.error("❌ Error al subir el archivo a Firebase Storage:", error);
      if (error.code === 'storage/unauthorized' || (error.message && error.message.includes('CORS'))) {
        console.error("   - Causa probable: Problema de CORS. Revisa la configuración del bucket en Google Cloud.");
        throw new Error("Error de permisos al subir archivo. Revisa la configuración CORS de tu bucket de Firebase Storage y asegúrate de que tu dominio esté permitido.");
      }
      throw new Error("No se pudo subir el archivo.");
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
    
    // No intentes eliminar las URLs de placeholder
    if (fileUrl.includes('placehold.co')) {
        console.log("No se elimina la imagen de placeholder.");
        return;
    }

    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      console.log(`✅ Archivo eliminado exitosamente de: ${fileUrl}`);
    } catch (error: any) {
      // Es común que el archivo no exista si el perfil anterior no tenía una imagen personalizada.
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

    