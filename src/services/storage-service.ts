
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
    // Asegurarse de que el campo se llame 'file', coincidiendo con la API
    formData.append('file', compressedFile);
    formData.append('path', path);

    try {
      // La llamada a la API sigue siendo la misma, pero la API ahora funciona correctamente
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido en la respuesta del servidor.' }));
        throw new Error(errorData.error || `Error en la subida: ${response.statusText}`);
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error("La respuesta de la API no incluyó una URL.");
      }
      return url;

    } catch (error) {
      console.error("Error al subir el archivo a través del proxy:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
