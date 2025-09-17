
"use client";

import React, { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css'; // Import styles

// Importar ReactQuill de forma dinámica para evitar problemas con SSR
import dynamic from 'next/dynamic';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  // Usar dynamic import para ReactQuill
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image'
  ];

  return (
    <div className="bg-white text-black rounded-md">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Escribe algo increíble...'}
        className="h-full"
      />
    </div>
  );
};

export default RichTextEditor;
