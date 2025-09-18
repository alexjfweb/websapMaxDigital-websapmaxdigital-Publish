// src/services/multipart-document-service.ts
import { doc, getDoc, collection, writeBatch, getDocs, deleteDoc, type Firestore, serverTimestamp } from 'firebase/firestore';

// Función para dividir objeto en chunks que respeten el límite de 1MB
function divideIntoChunks(data: any, maxSizeBytes = 900000) { // 900KB para margen de seguridad
  const chunks: any[] = [];
  let currentChunk: { [key: string]: any } = {};
  let currentSize = 0;
  
  for (const [key, value] of Object.entries(data)) {
    const entrySize = new Blob([JSON.stringify({ [key]: value })]).size;
    
    // Si un solo campo es muy grande, lo dividimos
    if (entrySize > maxSizeBytes) {
      if (typeof value === 'string') {
        // Dividir string largo en partes
        const parts: string[] = [];
        const chunkSize = Math.floor(maxSizeBytes / 2); // Tamaño conservador
        for (let i = 0; i < value.length; i += chunkSize) {
          parts.push(value.substring(i, i + chunkSize));
        }
        
        // Guardar chunk actual si tiene datos
        if (Object.keys(currentChunk).length > 0) {
          chunks.push({ ...currentChunk });
          currentChunk = {};
          currentSize = 0;
        }
        
        // Crear chunks para las partes del string
        parts.forEach((part, index) => {
          chunks.push({ [`${key}_part_${index}`]: part });
        });
        
        // Metadata para reconstruir
        chunks.push({ [`${key}_metadata`]: { 
          type: 'split_string', 
          parts: parts.length,
          originalKey: key
        }});
        
      } else {
        console.warn(`Campo ${key} demasiado grande y no es string:`, entrySize);
        // Para objetos grandes, convertir a JSON y dividir
        const jsonStr = JSON.stringify(value);
        const parts: string[] = [];
        const chunkSize = Math.floor(maxSizeBytes / 2);
        for (let i = 0; i < jsonStr.length; i += chunkSize) {
          parts.push(jsonStr.substring(i, i + chunkSize));
        }
        
        if (Object.keys(currentChunk).length > 0) {
          chunks.push({ ...currentChunk });
          currentChunk = {};
          currentSize = 0;
        }
        
        parts.forEach((part, index) => {
          chunks.push({ [`${key}_part_${index}`]: part });
        });
        
        chunks.push({ [`${key}_metadata`]: { 
          type: 'split_json', 
          parts: parts.length,
          originalKey: key
        }});
      }
    } else {
      // Si agregar este campo excede el límite, guardar chunk actual
      if (currentSize + entrySize > maxSizeBytes && Object.keys(currentChunk).length > 0) {
        chunks.push({ ...currentChunk });
        currentChunk = {};
        currentSize = 0;
      }
      
      currentChunk[key] = value;
      currentSize += entrySize;
    }
  }
  
  // Agregar último chunk si tiene datos
  if (Object.keys(currentChunk).length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Función principal para guardar en partes
export async function handleSaveInParts(db: Firestore, collectionName: string, documentId: string, data: any) {
  try {
    console.log('🚀 Iniciando guardado en partes...');
    
    // 1. Limpiar documentos existentes de este ID
    await cleanupExistingParts(db, collectionName, documentId);
    
    // 2. Dividir datos en chunks
    const chunks = divideIntoChunks(data);
    console.log(`📦 Dividido en ${chunks.length} partes`);
    
    // 3. Usar batch para operaciones atómicas
    const batch = writeBatch(db);
    
    // 4. Crear documento principal con metadata
    const mainDocRef = doc(db, collectionName, documentId);
    batch.set(mainDocRef, {
      isMultiPart: true,
      totalParts: chunks.length,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    
    // 5. Guardar cada chunk como subdocumento
    chunks.forEach((chunk, index) => {
      const partDocRef = doc(db, collectionName, documentId, 'parts', `part_${index}`);
      batch.set(partDocRef, {
        partIndex: index,
        data: chunk,
      });
    });
    
    // 6. Ejecutar todas las operaciones
    await batch.commit();
    
    console.log('✅ Guardado exitoso en múltiples documentos');
    return { success: true, parts: chunks.length };
    
  } catch (error) {
    console.error('❌ Error al guardar en partes:', error);
    throw error;
  }
}

// Función para limpiar partes existentes
async function cleanupExistingParts(db: Firestore, collectionName: string, documentId: string) {
  try {
    const partsRef = collection(db, collectionName, documentId, 'parts');
    const snapshot = await getDocs(partsRef);
    
    if (!snapshot.empty) {
      console.log(`🧹 Limpiando ${snapshot.size} partes existentes...`);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  } catch (error: any) {
    // It's okay if this fails, might be the first time.
    console.log('Info: No se encontraron partes existentes para limpiar o hubo un error menor, lo cual es normal en la primera ejecución.', error.message);
  }
}

// Función para leer datos divididos
export async function readMultiPartDocument(db: Firestore, collectionName: string, documentId: string): Promise<any | null> {
  try {
    const mainDocRef = doc(db, collectionName, documentId);
    const mainDoc = await getDoc(mainDocRef);
    
    if (!mainDoc.exists()) {
      console.warn(`Documento principal ${documentId} no encontrado. Se devolverá null.`);
      return null;
    }
    
    const mainData = mainDoc.data();
    if (!mainData.isMultiPart) {
      return mainData; // Documento normal, no dividido
    }
    
    const partsRef = collection(db, collectionName, documentId, 'parts');
    const partsSnapshot = await getDocs(partsRef);
    
    if (partsSnapshot.empty) {
        console.warn(`El documento ${documentId} está marcado como multi-parte pero no tiene sub-documentos.`);
        return { id: documentId };
    }
    
    const parts = partsSnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => a.partIndex - b.partIndex);
    
    let reconstructedData: { [key: string]: any } = {};
    const splitFields = new Map<string, { type: 'split_string' | 'split_json', parts: number, data: string[] }>();
    
    parts.forEach(part => {
      const chunkData = part.data;
      
      for (const [key, value] of Object.entries(chunkData)) {
        if (key.endsWith('_metadata')) {
          const metadata = value as any;
          splitFields.set(metadata.originalKey, {
            type: metadata.type,
            parts: metadata.parts,
            data: new Array(metadata.parts)
          });
        } else if (key.includes('_part_')) {
          const originalKey = key.split('_part_')[0];
          const partIndex = parseInt(key.split('_part_')[1]);
          
          if (!splitFields.has(originalKey)) {
             splitFields.set(originalKey, { data: [] } as any);
          }
          
          splitFields.get(originalKey)!.data[partIndex] = value as string;
        } else {
          reconstructedData[key] = value;
        }
      }
    });
    
    for (const [originalKey, fieldData] of splitFields.entries()) {
      if (fieldData.type === 'split_string') {
        reconstructedData[originalKey] = fieldData.data.join('');
      } else if (fieldData.type === 'split_json') {
        const jsonStr = fieldData.data.join('');
        try {
            reconstructedData[originalKey] = JSON.parse(jsonStr);
        } catch(e) {
            console.error(`Error parseando JSON reconstruido para el campo ${originalKey}:`, e);
            reconstructedData[originalKey] = {};
        }
      }
    }
    
    return reconstructedData;
    
  } catch (error) {
    console.error('❌ Error al leer documento multi-parte:', error);
    throw error;
  }
}
