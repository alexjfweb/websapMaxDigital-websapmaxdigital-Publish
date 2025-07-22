"use client";

import React from "react";

// Modal para vista previa en tiempo real de la landing
export default function PreviewModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
} 