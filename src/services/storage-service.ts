
// src/services/storage-service.ts - CON COMPRESIÓN INTELIGENTE y API de subida
import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen en el cliente y luego la sube a través de la API del servidor.
 * 
 * @param file El archivo de imagen a procesar.
 * @param path La ruta dentro del bucket donde se guardará (ej. 'landing-images').
 * @returns Una promesa que se resuelve con la URL pública de la imagen subida.
 */
const compressAndUploadFile = async (file: File, path: string): Promise<string> => {
  const maxSizeBytes = 800 * 1024; // Límite seguro de 800KB para Firestore

  const calculateOptimalSize = (originalWidth: number, originalHeight: number) => {
    const originalSize = originalWidth * originalHeight;
    let maxDimension;
    if (originalSize > 2000000) maxDimension = 800;
    else if (originalSize > 1000000) maxDimension = 1000;
    else if (originalSize > 500000) maxDimension = 1200;
    else maxDimension = 1400;

    const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight, 1);
    return {
      width: Math.floor(originalWidth * ratio),
      height: Math.floor(originalHeight * ratio)
    };
  };

  const compressIteratively = (canvas: HTMLCanvasElement, quality = 0.9): string => {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const sizeInBytes = dataUrl.length * (3/4); // Approx. Base64 to bytes
    
    console.log(`Probando calidad ${quality.toFixed(2)}: ${(sizeInBytes / 1024).toFixed(1)}KB`);

    if (sizeInBytes <= maxSizeBytes || quality <= 0.1) {
      if (sizeInBytes > maxSizeBytes) {
        console.warn(`La imagen no pudo ser comprimida por debajo de ${maxSizeBytes/1024}KB. Tamaño final: ${(sizeInBytes / 1024).toFixed(1)}KB`);
      }
      return dataUrl;
    }
    return compressIteratively(canvas, quality - 0.1);
  };
  
  const autoCompress = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      
      const img = new Image();
      img.onload = () => {
        const { width, height } = calculateOptimalSize(img.width, img.height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = compressIteratively(canvas);
        
        // Convert base64 back to Blob for uploading
        fetch(compressedDataUrl)
          .then(res => res.blob())
          .then(blob => {
              console.log(`Compresión finalizada. Tamaño: ${(blob.size / 1024).toFixed(2)}KB`);
              resolve(blob);
          })
          .catch(reject);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  try {
    console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)}KB`);
    const compressedBlob = await autoCompress(file);
    console.log(`Tamaño comprimido para subir: ${(compressedBlob.size / 1024).toFixed(2)}KB`);

    const formData = new FormData();
    formData.append('file', compressedBlob, file.name);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error en la API de subida');
    }

    return result.url;

  } catch (error) {
    console.error('Error durante la compresión y subida:', error);
    throw error;
  }
};


// Función para eliminar un archivo. Requiere una implementación de API si se necesita desde el cliente
// Por ahora, se asume que la lógica que elimina archivos (ej. en un update) se hace en el backend.
const deleteFile = async (fileUrl: string): Promise<void> => {
    // Esta función está intencionadamente vacía en el cliente.
    // La eliminación debe ser manejada por una API segura en el backend
    // para evitar que cualquier usuario pueda borrar archivos.
    console.warn(`[storage-service] La eliminación de archivos desde el cliente no está implementada por seguridad. URL: ${fileUrl}`);
    return Promise.resolve();
};

export const storageService = {
  compressAndUploadFile,
  deleteFile
};
