"use client";

import { useState } from "react";
import { landingConfigService } from "@/services/landing-config-service";

export default function SectionToggle({ onMessage, sections, onSectionsChange }: {
  onMessage?: (msg: any) => void,
  sections: any,
  onSectionsChange: (sections: any) => void
}) {
  const [saving, setSaving] = useState(false);

  const SECTIONS = [
    { key: "banner", label: "Banner principal" },
    { key: "serviceCards", label: "Tarjetas de servicios" },
    { key: "plans", label: "Sección de planes" },
    { key: "contact", label: "Contacto" },
    { key: "social", label: "Redes sociales" },
    { key: "video", label: "Video promocional" },
  ];

  const handleToggle = (key: string) => {
    onSectionsChange({ ...sections, [key]: !sections[key] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await landingConfigService.updateLandingConfig({ sections });
      onMessage && onMessage({ open: true, type: "success", title: "Guardado", message: "Secciones actualizadas correctamente" });
    } catch (e) {
      onMessage && onMessage({ open: true, type: "error", title: "Error", message: "No se pudo guardar el estado de las secciones" });
    } finally {
      setSaving(false);
    }
  };

  if (!sections) return <div className="py-4 text-center">Cargando secciones...</div>;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Secciones visibles</h2>
      <div className="flex flex-col gap-2 mb-4">
        {SECTIONS.map((section) => (
          <label key={section.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!sections[section.key]}
              onChange={() => handleToggle(section.key)}
              className="w-5 h-5"
            />
            {section.label}
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar secciones"}
        </button>
      </div>
    </div>
  );
} 