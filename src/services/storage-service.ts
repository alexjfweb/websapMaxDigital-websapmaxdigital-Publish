
// src/services/storage-service.ts
import imageCompression from 'browser-image-compression';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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
    const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
    const storageRef = ref(storage, `${path}${uniqueFileName}`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso de subida: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error("Error en la subida a Firebase Storage:", error);
          reject(new Error(`Error de subida: ${error.code}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error al obtener la URL de descarga:", error);
            reject(new Error("No se pudo obtener la URL de descarga."));
          }
        }
      );
    });
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
