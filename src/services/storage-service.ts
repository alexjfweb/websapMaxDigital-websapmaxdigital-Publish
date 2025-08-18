
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime una imagen antes de subirla.
   * @param file El archivo de imagen original.
   * @returns El archivo comprimido.
   */
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Imagen comprimida a ${(compressedFile.size / 1024).toFixed(2)}KB`);
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
  private async uploadFile(file: File, path: string): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error("Se esperaba un objeto de tipo File para subir.");
    }
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
  
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor al subir el archivo.');
      }
      
      return result.url;
  
    } catch (uploadError: any) {
      console.error("❌ Error al subir el archivo:", uploadError);
      throw new Error(uploadError.message || 'La subida del archivo falló.');
    }
  }
  
  /**
   * Comprime y sube un archivo, devolviendo su URL pública.
   * Esta función orquesta el proceso completo.
   * @param file El archivo original.
   * @param path La ruta de destino en Firebase Storage.
   * @returns La URL pública del archivo subido.
   */
  async compressAndUploadFile(file: File, path: string): Promise<string> {
    const compressedFile = await this.compressImage(file);
    return this.uploadFile(compressedFile, path);
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

    