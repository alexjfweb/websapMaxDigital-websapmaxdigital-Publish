
// src/services/storage-service.ts
// CORREGIDO para usar API del servidor como proxy y evitar CORS.

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase"; // Usamos la instancia del cliente, pero solo para compatibilidad.
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

  // Función principal CORREGIDA - usando API del servidor
  public async compressAndUploadFile(file: File, path: string = 'uploads'): Promise<string> {
    try {
      console.log('🚀 Iniciando proceso de compresión y subida...');
      
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file);
      }

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('path', path); // Opcional: enviar la ruta al servidor

      console.log('📤 Enviando archivo al SERVIDOR (no directamente a Firebase)...', {
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type
      });

      // CRUCIAL: Enviar a NUESTRA API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Detalles del error del servidor:', result);
        throw new Error(result.error || `Error ${response.status}`);
      }

      if (!result.success || !result.url) {
        throw new Error('Respuesta del servidor inválida o incompleta');
      }

      console.log('✅ Archivo subido exitosamente a través del servidor:', result.url);
      return result.url;

    } catch (error: any) {
      console.error('❌ Error en compressAndUploadFile:', error);
      throw new Error(`Error al subir el archivo a través del proxy: ${error.message}`);
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

export const storageService = StorageService.getInstance();
