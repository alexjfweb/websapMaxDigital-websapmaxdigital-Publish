
// src/services/storage-service.ts - CORREGIDO para usar Base64 en Firestore

import imageCompression from 'browser-image-compression';

class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Función para comprimir imagen
  private async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 0.5, // Reducimos el tamaño máximo para Base64
      maxWidthOrHeight: 800, // Reducimos la resolución
      useWebWorker: true,
    };
    try {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Imagen comprimida a ${(compressedFile.size / 1024).toFixed(2)}KB`);
      return compressedFile;
    } catch (error) {
      console.error("Error en la compresión, usando archivo original:", error);
      return file;
    }
  }

  // Función principal CORREGIDA - Convierte a Base64 en lugar de subir
  public async compressAndConvertToBase64(file: File): Promise<string> {
    try {
      console.log('🚀 Iniciando proceso de compresión y conversión a Base64...');
      
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file);
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

    } catch (error: any) {
      console.error('❌ Error en compressAndConvertToBase64:', error);
      throw new Error(`Error al procesar la imagen: ${error.message}`);
    }
  }

  // Las funciones de subida y borrado de la API ya no son necesarias para este flujo
  public async uploadFile(file: File, path: string): Promise<string> {
      console.warn("uploadFile a API está en desuso. Usando conversión a Base64.");
      return this.compressAndConvertToBase64(file);
  }
  
  public async deleteFile(fileUrl: string): Promise<void> {
      // Si la URL es una URL de Firebase Storage, intenta eliminarla.
      // Si es una data URI (Base64), no hace nada.
      if (fileUrl && fileUrl.startsWith('https://storage.googleapis.com')) {
           console.log(`(Simulado) La eliminación de ${fileUrl} debe implementarse en el servidor si se requiere.`);
      }
      return Promise.resolve();
  }
}

export const storageService = StorageService.getInstance();
