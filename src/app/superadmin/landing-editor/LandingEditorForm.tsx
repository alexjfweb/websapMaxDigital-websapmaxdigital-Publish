"use client";

import { useEffect, useState } from "react";

export default function LandingEditorForm({ onMessage, config, onConfigChange }: {
  onMessage?: (msg: any) => void,
  config: any,
  onConfigChange: (partial: any) => void
}) {
  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    onConfigChange({ [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí podrías llamar a un servicio para guardar si lo deseas
      onMessage && onMessage({ open: true, type: "success", title: "Guardado", message: "Cambios guardados correctamente" });
    } catch (e) {
      onMessage && onMessage({ open: true, type: "error", title: "Error", message: "No se pudo guardar la configuración" });
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div className="py-8 text-center">Cargando configuración...</div>;

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Contenido principal</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-medium">Título principal</label>
          <input
            type="text"
            name="mainTitle"
            value={config.mainTitle || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="block font-medium">Subtítulo</label>
          <input
            type="text"
            name="subtitle"
            value={config.subtitle || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="block font-medium">Color de botón</label>
          <input
            type="color"
            name="buttonColor"
            value={config.buttonColor || "#1976d2"}
            onChange={handleChange}
            className="w-16 h-10 p-0 border-none bg-transparent"
          />
        </div>
        <div>
          <label className="block font-medium">Color de texto</label>
          <input
            type="color"
            name="textColor"
            value={config.textColor || "#222222"}
            onChange={handleChange}
            className="w-16 h-10 p-0 border-none bg-transparent"
          />
        </div>
        {/* Aquí se pueden agregar más campos según el modelo */}
      </div>
      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar sección"}
        </button>
      </div>
    </div>
  );
} 