
// storage-service.ts
export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Función para comprimir imagen
  private compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      console.log(`Comprimiendo imagen de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular dimensiones manteniendo aspect ratio
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Imagen comprimida a ${(blob.size / 1024).toFixed(2)}KB`);
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              console.log('Error en compresión, usando archivo original');
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Función principal para comprimir y subir archivo
  public async compressAndUploadFile(file: File): Promise<string> {
    try {
      console.log('🚀 Iniciando proceso de compresión y subida...');
      
      // 1. Comprimir la imagen si es necesario
      let processedFile = file;
      if (file.type.startsWith('image/') && file.size > 500 * 1024) { // >500KB
        processedFile = await this.compressImage(file);
      }

      // 2. Crear FormData
      const formData = new FormData();
      formData.append('file', processedFile);

      console.log('📤 Enviando archivo al servidor...', {
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type
      });

      // 3. Enviar al servidor con timeout y mejor manejo de errores
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // 4. Procesar respuesta
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        let errorDetails = null;

        try {
          const errorData = await response.json();
          console.error('❌ Detalles del error del servidor:', errorData);
          
          if (errorData.error) {
            errorMessage = errorData.error;
          }
          
          if (errorData.details) {
            errorDetails = errorData.details;
          }

          if (errorData.step) {
            errorMessage += ` (Paso: ${errorData.step})`;
          }
        } catch (parseError) {
          console.error('❌ No se pudo parsear respuesta de error:', parseError);
          const textError = await response.text().catch(() => 'No se pudo obtener el error');
          console.error('❌ Respuesta de error como texto:', textError);
        }

        throw new Error(errorDetails ? `${errorMessage} - ${errorDetails}` : errorMessage);
      }

      // 5. Procesar respuesta exitosa
      const result = await response.json();
      console.log('✅ Respuesta exitosa:', result);

      if (!result.success || !result.url) {
        throw new Error('Respuesta del servidor incompleta: falta URL');
      }

      console.log('✅ Archivo subido exitosamente:', result.url);
      return result.url;

    } catch (error: any) {
      console.error('❌ Error en compressAndUploadFile:', error);
      
      // Mensajes de error más específicos
      if (error.name === 'AbortError') {
        throw new Error('La subida del archivo ha excedido el tiempo límite (30 segundos)');
      }
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
      }

      // Re-lanzar error con contexto
      throw new Error(`Error al subir el archivo a través del proxy: ${error.message}`);
    }
  }
}
