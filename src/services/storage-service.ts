// src/services/storage-service.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
   * Sube un archivo directamente a Firebase Storage desde el cliente.
   * @param file El archivo a subir.
   * @param path La ruta de destino en Storage (ej. 'images/').
   * @returns La URL de descarga pública del archivo.
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!(file instanceof File)) {
      console.error("Error en uploadFile: el argumento no es un objeto File.", file);
      throw new Error("Se esperaba un objeto de tipo File para subir.");
    }
    try {
      const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
      const storageRef = ref(storage, `${path}/${uniqueFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Archivo subido con éxito a Firebase Storage. URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("¡ERROR FATAL DURANTE LA SUBIDA DIRECTA A FIREBASE!", error);
      // Aquí puedes agregar un sistema de logging más avanzado si es necesario
      throw new Error("No se pudo subir el archivo. Revisa las reglas de Storage y la configuración de Firebase.");
    }
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
      // Ignorar errores si el archivo no existe (puede haber sido eliminado previamente)
      if (error.code !== 'storage/object-not-found') {
        console.error("Error al eliminar archivo de Storage:", error);
        // No relanzar el error para no interrumpir flujos de usuario si solo falla la limpieza
      }
    }
  }
}

export const storageService = new StorageService();
