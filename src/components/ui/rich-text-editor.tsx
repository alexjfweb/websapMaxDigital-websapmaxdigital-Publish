"use client";
import React, { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);

  // Registrar módulos de alineación explícitamente
  useEffect(() => {
    const registerQuillModules = async () => {
      // Usamos un import() dinámico para asegurarnos que se ejecuta en el cliente
      const Quill = (await import('react-quill')).default;
      if (Quill && typeof window !== 'undefined') {
          const AlignClass = Quill.import('attributors/class/align');
          const AlignStyle = Quill.import('attributors/style/align');
          Quill.register(AlignClass, true);
          Quill.register(AlignStyle, true);
      }
    };
    
    registerQuillModules();
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      [{ 'align': ['', 'center', 'right', 'justify'] }],
      [{ 'color': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'color',
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
