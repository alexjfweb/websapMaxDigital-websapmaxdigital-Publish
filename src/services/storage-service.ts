
// src/services/storage-service.ts - CORREGIDO para usar API del servidor

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
      formData.append('path', path);

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
  
    // Esta función ya no se usa para subidas, pero puede ser útil para borrados si se implementa.
    public async deleteFile(fileUrl: string): Promise<void> {
        console.warn(`(Simulado) La eliminación de ${fileUrl} debe implementarse en el servidor si se requiere.`);
    }
}

export const storageService = StorageService.getInstance();
