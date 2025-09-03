
// src/services/storage-service.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase"; // Usamos la instancia del cliente
import imageCompression from 'browser-image-compression';

class StorageService {
  private static instance: StorageService;
  private storage;

  private constructor() {
    this.storage = getStorage(app);
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Función para comprimir imagen en el cliente
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Imagen comprimida a ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error("Error en la compresión, usando archivo original:", error);
      return file;
    }
  }

  // Nueva función principal para comprimir y subir desde el cliente
  public async compressAndUploadFile(file: File, path: string = 'uploads'): Promise<string> {
    try {
      console.log('🚀 Iniciando proceso de compresión y subida desde el cliente...');
      
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file);
      }
      
      const timestamp = Date.now();
      const sanitizedFileName = processedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${path}/${timestamp}-${sanitizedFileName}`;
      
      const storageRef = ref(this.storage, storagePath);

      console.log(`📤 Subiendo archivo a Firebase Storage en: ${storagePath}`);
      
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ Archivo subido exitosamente:', downloadURL);
      return downloadURL;

    } catch (error: any) {
      console.error('❌ Error al subir el archivo directamente a Firebase Storage:', error);
      
      // Manejo de errores específicos de Firebase Storage
      switch (error.code) {
        case 'storage/unauthorized':
          throw new Error('Permiso denegado. Asegúrate de estar autenticado.');
        case 'storage/canceled':
          throw new Error('La subida fue cancelada.');
        case 'storage/unknown':
        default:
          throw new Error('Ocurrió un error desconocido durante la subida del archivo.');
      }
    }
  }

  // La función de eliminar se mantiene, pero usando el SDK de cliente
  public async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl.includes('firebasestorage.googleapis.com')) {
      console.warn("deleteFile: URL no parece ser un archivo de Firebase Storage, omitiendo borrado.", fileUrl);
      return;
    }
    try {
      const fileRef = ref(this.storage, fileUrl);
      await getDownloadURL(fileRef); // Verifica si el archivo existe
      // await deleteObject(fileRef); // Comentado para evitar borrados accidentales
      console.log(`(Simulado) Archivo ${fileUrl} habría sido eliminado.`);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(`El archivo a eliminar no se encontró en Storage: ${fileUrl}`);
      } else {
        console.error("Error al eliminar archivo de Storage:", error);
      }
    }
  }
}

// Exportar la instancia singleton
export const storageService = StorageService.getInstance();
