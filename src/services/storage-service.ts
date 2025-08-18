
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime una imagen antes de subirla.
   * @param file El archivo de imagen original.
   * @returns El archivo comprimido como un objeto File.
   */
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280, // Ligeramente mayor para mejor calidad
      useWebWorker: true,
      initialQuality: 0.8, // Calidad inicial
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedBlob = await imageCompression(file, options);
      console.log(`Imagen comprimida a ${(compressedBlob.size / 1024).toFixed(2)}KB`);
      // **LA CORRECCIÓN CLAVE**: Convertir el Blob de vuelta a un File
      return new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      // Devuelve el archivo original si la compresión falla
      return file;
    }
  }

  /**
   * Sube un archivo al servidor de la aplicación, que luego lo reenviará a Firebase Storage.
   * @param file El archivo a subir. Debe ser un objeto File.
   * @param path La ruta de destino en Storage (ej. 'avatars/').
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    // Validación para asegurar que es un objeto File
    if (!(file instanceof File)) {
      console.error("Error en uploadFile: el argumento 'file' no es un objeto File.", file);
      throw new Error(`Error en uploadFile: el argumento 'file' no es un objeto File. Recibido: ${Object.prototype.toString.call(file)}`);
    }
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
  
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: `Error del servidor: ${response.statusText}` }));
        throw new Error(result.error || `Error del servidor: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ ¡Imagen subida con éxito! URL:', result.url);
      return result.url;
  
    } catch (uploadError: any) {
      console.error("¡ERROR FATAL DURANTE LA SUBIDA A FIREBASE!", uploadError);
      throw new Error(`La subida del archivo falló: ${uploadError.message}`);
    }
  }
  
  /**
   * Comprime y sube un archivo, devolviendo su URL pública.
   * Esta función orquesta el proceso completo.
   * @param file El archivo original.
   * @returns La URL pública del archivo subido.
   */
  async compressAndUploadFile(file: File, path: string = 'landing-images/subsections/'): Promise<string> {
    const compressedFile = await this.compressImage(file);
    // Ahora 'compressedFile' es un objeto File y se puede pasar directamente.
    return this.uploadFile(compressedFile, path);
  }

  /**
   * Elimina un archivo de Firebase Storage.
   * @param fileUrl La URL del archivo a eliminar.
   */
  async deleteFile(fileUrl: string): Promise<void> {
    console.warn("La eliminación de archivos desde el cliente debe manejarse con cuidado. Considere un endpoint de backend.");
    // La lógica de eliminación real requeriría una llamada a un endpoint de backend seguro.
  }
}

export const storageService = new StorageService();
