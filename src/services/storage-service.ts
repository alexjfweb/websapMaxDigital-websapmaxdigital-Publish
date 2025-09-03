
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

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
      console.error("Error al comprimir la imagen, se subirá el original:", error);
      return file;
    }
  }

  async compressAndUploadFile(file: File, path: string = 'images/'): Promise<string> {
    const compressedFile = await this.compressImage(file);
    
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('path', path);

    // Llamar a nuestra API de backend que actuará como proxy
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al subir el archivo.');
    }

    return result.url;
  }
  
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      console.log(`Archivo eliminado: ${fileUrl}`);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error("Error al eliminar archivo de Storage:", error);
      }
    }
  }
}

export const storageService = new StorageService();
