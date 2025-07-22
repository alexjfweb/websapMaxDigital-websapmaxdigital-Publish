"use client";

import { useState } from "react";

interface Plan {
  id?: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  ctaText: string;
  order: number;
  active: boolean;
}

const EMPTY_PLAN: Plan = {
  name: "",
  price: 0,
  period: "mes",
  features: [],
  ctaText: "Suscribirse",
  order: 0,
  active: true,
};

export default function PlansManager({ onMessage, plans, onPlansChange }: {
  onMessage?: (msg: any) => void,
  plans: Plan[],
  onPlansChange: (plans: Plan[]) => void
}) {
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [featureInput, setFeatureInput] = useState("");

  // Función para generar ID único
  const generateUniqueId = () => {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleEdit = (plan: Plan) => {
    setEditing({ ...plan });
    setFeatureInput("");
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    onPlansChange(plans.filter((p) => p.id !== id));
    // El mensaje se maneja en el componente padre
  };

  const handleSave = () => {
    if (!editing) return;
    
    // Asegurar que el plan tenga un ID único
    const planToSave = editing.id ? editing : { ...editing, id: generateUniqueId() };
    
    if (editing.id) {
      onPlansChange(plans.map((p) => (p.id === editing.id ? planToSave : p)));
      // El mensaje se maneja en el componente padre
    } else {
      onPlansChange([...plans, { ...planToSave, order: plans.length }]);
      // El mensaje se maneja en el componente padre
    }
    setEditing(null);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setEditing((prev) => prev ? { ...prev, features: [...prev.features, featureInput.trim()] } : prev);
    setFeatureInput("");
  };

  const handleRemoveFeature = (idx: number) => {
    setEditing((prev) => prev ? { ...prev, features: prev.features.filter((_, i) => i !== idx) } : prev);
  };

  const handleOrderChange = (from: number, to: number) => {
    if (from === to) return;
    const reordered = [...plans];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onPlansChange(reordered);
    // El mensaje se maneja en el componente padre
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Planes de Suscripción</h2>
      <div className="mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEditing({ ...EMPTY_PLAN, id: generateUniqueId() })}>
          Nuevo plan
        </button>
      </div>
      <div className="space-y-2">
        {plans.map((plan, idx) => (
          <div key={`${plan.id || 'temp'}_${idx}`} className="border rounded p-4 flex flex-col md:flex-row md:items-center gap-2 justify-between">
            <div>
              <div className="font-bold">{plan.name}</div>
              <div className="text-sm text-gray-600">{plan.price} / {plan.period}</div>
              <ul className="text-xs mt-1">
                {plan.features.map((f, i) => <li key={`${plan.id || 'temp'}_feature_${i}`}>- {f}</li>)}
              </ul>
              <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-gray-200">{plan.ctaText}</span>
            </div>
            <div className="flex gap-2 items-center">
              <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(plan)}>Editar</button>
              <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(plan.id)}>Eliminar</button>
              <button className="bg-gray-300 px-2 py-1 rounded" disabled={idx === 0} onClick={() => handleOrderChange(idx, idx - 1)}>↑</button>
              <button className="bg-gray-300 px-2 py-1 rounded" disabled={idx === plans.length - 1} onClick={() => handleOrderChange(idx, idx + 1)}>↓</button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setEditing(null)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">{editing.id ? "Editar plan" : "Nuevo plan"}</h3>
            <div className="space-y-2">
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="Nombre" value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="Precio" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="Periodicidad" value={editing.period || "mes"} onChange={e => setEditing({ ...editing, period: e.target.value })} />
              <div>
                <div className="font-medium mb-1">Características</div>
                <div className="flex gap-2 mb-2">
                  <input type="text" className="flex-1 border rounded px-2 py-1" placeholder="Nueva característica" value={featureInput} onChange={e => setFeatureInput(e.target.value)} />
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddFeature}>Agregar</button>
                </div>
                <ul className="text-xs">
                  {editing.features.map((f, i) => (
                    <li key={`${editing.id || 'temp'}_edit_feature_${i}`} className="flex items-center gap-2">
                      {f}
                      <button className="text-red-500 text-xs" onClick={() => handleRemoveFeature(i)}>Quitar</button>
                    </li>
                  ))}
                </ul>
              </div>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="Texto botón CTA" value={editing.ctaText || ""} onChange={e => setEditing({ ...editing, ctaText: e.target.value })} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.active || false} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 