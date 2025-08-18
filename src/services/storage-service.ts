// src/services/storage-service.ts
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Usamos la instancia del cliente
import imageCompression from 'browser-image-compression';

const storage = getStorage(app);

class StorageService {
  /**
   * Comprime una imagen antes de subirla.
   * @param file El archivo de imagen original.
   * @returns El archivo comprimido como un objeto File.
   */
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
      console.log(`Imagen comprimida a ${(compressedBlob.size / 1024).toFixed(2)}KB`);
      // Convertir Blob a File para asegurar compatibilidad
      return new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
    } catch (error) {
      console.error("Error al comprimir la imagen, se subirá el original:", error);
      return file;
    }
  }

  /**
   * Sube un archivo directamente a Firebase Storage usando un método resumible
   * que permite monitorear el progreso y manejar errores de forma más granular.
   * @param file El archivo a subir.
   * @param path La ruta de destino en Storage (ej. 'images/').
   * @returns Una promesa que se resuelve con la URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!(file instanceof File)) {
      console.error("Error en uploadFile: el argumento no es un objeto File.", file);
      throw new Error("Se esperaba un objeto de tipo File para subir.");
    }

    return new Promise((resolve, reject) => {
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
        const storageRef = ref(storage, `${path}/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Progreso de subida: ${progress.toFixed(2)}%`);
            },
            (error) => {
                console.error("¡ERROR FATAL DURANTE LA SUBIDA A FIREBASE!", error);
                 if (error.code === 'storage/unauthorized' || error.code === 'storage/unknown') {
                    reject(new Error('Error de permisos o CORS. Por favor, verifica la configuración de CORS en tu bucket de Firebase Storage y las reglas de seguridad.'));
                } else {
                    reject(new Error('Error interno del servidor al subir el archivo.'));
                }
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('✅ Archivo subido con éxito a Firebase Storage. URL:', downloadURL);
                    resolve(downloadURL);
                } catch (urlError) {
                    console.error("Error obteniendo la URL de descarga:", urlError);
                    reject(new Error("La subida se completó pero no se pudo obtener la URL."));
                }
            }
        );
    });
  }

  /**
   * Comprime y sube un archivo, devolviendo su URL pública.
   * @param file El archivo original.
   * @param path La ruta de destino en Storage.
   * @returns La URL pública del archivo subido.
   */
  async compressAndUploadFile(file: File, path: string = 'images/'): Promise<string> {
    const compressedFile = await this.compressImage(file);
    return this.uploadFile(compressedFile, path);
  }

  /**
   * Elimina un archivo de Firebase Storage.
   * @param fileUrl La URL completa del archivo a eliminar.
   */
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
