
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TestFirestorePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        console.log("Iniciando fetch de planes...");
        const snapshot = await getDocs(collection(db, "landingPlans"));
        if (snapshot.empty) {
          console.log("No se encontraron documentos en 'landingPlans'.");
          setError("No se encontraron planes. La colección puede estar vacía o el nombre es incorrecto.");
        } else {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log("Planes encontrados:", data);
          setPlans(data);
        }
      } catch (err: any) {
        console.error("Error leyendo Firestore:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Página de Prueba de Firestore</h1>
      <p className="text-muted-foreground mb-4">Esta página intenta leer directamente la colección 'landingPlans'.</p>
      
      {loading && <p className="text-blue-600">Cargando datos de planes...</p>}
      
      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <p className="font-bold">Error:</p> 
        <p>{error}</p>
        <p className="mt-2 text-sm">Verifica las reglas de seguridad de Firestore y el nombre de la colección.</p>
        </div>
      }
      
      {plans.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-4">✅ Planes Encontrados:</h2>
          <ul className="list-disc list-inside mt-2">
            {plans.map(p => (
              <li key={p.id}>{p.name} — ${p.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
