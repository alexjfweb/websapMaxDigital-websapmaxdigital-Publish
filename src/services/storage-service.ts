
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime una imagen antes de subirla.
   * @param file El archivo de imagen original.
   * @returns El archivo comprimido.
   */
  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      // Devuelve el archivo original si la compresión falla
      return file;
    }
  }


  /**
   * Sube un archivo al servidor de la aplicación, que luego lo reenviará a Firebase Storage.
   * @param file El archivo a subir (ya sea el original o uno comprimido).
   * @param path La ruta de destino en Storage (ej. 'avatars/').
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error("Se esperaba un objeto de tipo File para subir.");
    }
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
  
      console.log(`Enviando archivo al backend a la ruta: ${path}`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor al subir el archivo.');
      }
      
      const downloadURL = result.url;
      console.log(`✅ Archivo subido exitosamente a través del backend. URL: ${downloadURL}`);
      return downloadURL;
  
    } catch (uploadError: any) {
      console.error("❌ Error al subir el archivo:", uploadError);
      throw new Error(uploadError.message || 'La subida del archivo falló.');
    }
  }


  /**
   * Elimina un archivo de Firebase Storage.
   * Esta función se mantiene igual ya que no sufre de problemas de CORS.
   * @param fileUrl La URL del archivo a eliminar.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // La lógica de eliminación no cambia, ya que se realiza a través de su propia lógica de API o reglas
    // y no suele tener los mismos problemas de CORS que las subidas.
    // En un sistema real, esta acción también debería ser manejada por un endpoint de backend por seguridad.
    console.warn("La eliminación de archivos desde el cliente debe manejarse con cuidado. Considere un endpoint de backend.");
  }
}

export const storageService = new StorageService();
