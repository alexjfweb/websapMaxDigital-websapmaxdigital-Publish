"use client";

import React from "react";

// Modal reutilizable para mensajes (error, confirmación, advertencia)
export default function MessageModal({ open, type, title, message, onClose, onConfirm }: {
  open: boolean;
  type: "error" | "success" | "warning";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  if (!open) return null;
  let color = type === "error" ? "red" : type === "success" ? "green" : "yellow";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-lg shadow-lg max-w-md w-full p-6 border-t-8 border-${color}-500 relative`}>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose}>&times;</button>
        <h3 className={`text-lg font-bold mb-2 text-${color}-600`}>{title}</h3>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          {onConfirm && <button className={`bg-${color}-500 text-white px-4 py-2 rounded`} onClick={onConfirm}>Aceptar</button>}
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
} 