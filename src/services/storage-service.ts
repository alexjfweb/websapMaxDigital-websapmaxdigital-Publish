
// src/services/storage-service.ts - CON COMPRESIÓN INTELIGENTE PARA FIRESTORE

/**
 * Comprime una imagen de forma inteligente para no superar el límite de Firestore.
 * - Ajusta las dimensiones según el tamaño original.
 * - Reduce la calidad iterativamente hasta que la imagen pese menos de 800KB.
 * - Devuelve la imagen como un string base64.
 * 
 * @param file El archivo de imagen a procesar.
 * @returns Una promesa que se resuelve con el string base64 de la imagen comprimida.
 */
const compressAndConvertToBase64 = async (file: File): Promise<string> => {
  const MAX_SIZE_BYTES = 800 * 1024; // Límite seguro de 800KB para Firestore

  console.log('🚀 Iniciando compresión automática inteligente para Firestore...');
  console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)}KB`);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('No se pudo obtener el contexto del canvas.'));
    }
    const img = new Image();
    
    img.onload = () => {
      // 1. Calcular dimensiones óptimas
      const originalSize = img.width * img.height;
      let maxDimension;
      
      if (originalSize > 2000000) maxDimension = 800; // Muy grande
      else if (originalSize > 1000000) maxDimension = 1000; // Grande
      else if (originalSize > 500000) maxDimension = 1200; // Mediana
      else maxDimension = 1400; // Pequeña

      const ratio = Math.min(maxDimension / img.width, maxDimension / img.height, 1);
      const width = Math.floor(img.width * ratio);
      const height = Math.floor(img.height * ratio);
      
      canvas.width = width;
      canvas.height = height;
      
      // 2. Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      console.log(`Imagen redimensionada: ${img.width}x${img.height} → ${width}x${height}`);

      // 3. Comprimir iterativamente hasta que quepa en el límite
      let quality = 0.9; // Empezar con alta calidad
      let compressedDataUrl = '';

      const compressLoop = () => {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeInBytes = compressedDataUrl.length * (3 / 4); // Estimación del tamaño en bytes desde base64
        
        console.log(`Probando calidad ${quality.toFixed(2)}: ${(sizeInBytes / 1024).toFixed(2)}KB`);
        
        if (sizeInBytes <= MAX_SIZE_BYTES || quality <= 0.1) {
          if (sizeInBytes > MAX_SIZE_BYTES) {
              console.warn(`⚠️ La imagen no pudo ser comprimida por debajo de ${MAX_SIZE_BYTES / 1024}KB. Tamaño final: ${(sizeInBytes / 1024).toFixed(2)}KB`);
          } else {
              console.log(`✅ Compresión exitosa. Tamaño final: ${(sizeInBytes / 1024).toFixed(2)}KB`);
          }
          resolve(compressedDataUrl);
        } else {
          quality -= 0.1; // Reducir calidad
          setTimeout(compressLoop, 0); // Continuar en el siguiente ciclo de eventos
        }
      };
      
      compressLoop();
    };

    img.onerror = (error) => {
        console.error("Error al cargar la imagen en el objeto Image:", error);
        reject(new Error("No se pudo cargar el archivo de imagen."));
    };

    img.src = URL.createObjectURL(file);
  });
};


// Función para subir a Firebase Storage (ahora obsoleta en el flujo principal, pero mantenida)
const uploadFile = async (file: File, path: string): Promise<string> => {
    console.warn("uploadFile a API está en desuso. Usando compresión y conversión a Base64.");
    return compressAndConvertToBase64(file);
};

// Función para eliminar archivo de Firebase Storage
const deleteFile = async (fileUrl: string): Promise<void> => {
    // La eliminación ya no es necesaria si la imagen está en el documento.
    if (fileUrl && fileUrl.startsWith('https://storage.googleapis.com')) {
         console.log(`(Simulado) La eliminación de ${fileUrl} ya no es necesaria ya que la imagen se guarda en el documento.`);
    }
    return Promise.resolve();
};

export const storageService = {
  compressAndConvertToBase64,
  uploadFile, // Mantenido por si se usa en otro lugar
  deleteFile
};
