// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';

class StorageService {

  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.8,
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
      console.log(`Imagen comprimida a ${(compressedFile.size / 1024).toFixed(2)}KB`);
      return compressedFile;
    } catch (error) {
      console.error("Error al comprimir la imagen, se usará el original:", error);
      return file;
    }
  }
  
  async compressAndUploadFile(file: File, path: string = 'images/'): Promise<string> {
    const compressedFile = await this.compressImage(file);
    
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('path', path);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error en la subida: ${response.statusText}`);
      }

      const { url } = await response.json();
      return url;

    } catch (error) {
      console.error("Error al subir el archivo a través del proxy:", error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // La lógica de eliminación puede seguir siendo directa si las reglas lo permiten,
    // o también podría ser a través de un endpoint de API si es necesario.
    // Por ahora, lo mantenemos así, ya que no ha presentado problemas.
    console.log("La eliminación de archivos desde el cliente no está implementada a través del proxy. Se requiere un endpoint de API si es necesario.");
  }
}

export const storageService = new StorageService();
