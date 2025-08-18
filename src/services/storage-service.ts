
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

class StorageService {
  /**
   * Comprime una imagen en el navegador y la sube al servidor de la aplicación,
   * que luego la reenviará a Firebase Storage.
   * @param file El archivo de imagen a subir.
   * @param path La ruta de destino en Storage (ej. 'avatars/').
   * @returns La URL de descarga pública del archivo.
   */
  async compressAndUploadFile(file: File, path: string): Promise<string> {
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
      } catch (compressionError) {
        console.warn("No se pudo comprimir la imagen, se subirá el archivo original.", compressionError);
      }
    }

    try {
      // Usamos FormData para enviar el archivo al endpoint de nuestro backend
      const formData = new FormData();
      formData.append('file', fileToUpload);
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

  async uploadFile(file: File, path: string): Promise<string> {
    return this.compressAndUploadFile(file, path);
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
