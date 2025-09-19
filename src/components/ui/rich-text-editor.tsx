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

  // Registrar módulos de alineación cuando el componente se monte
  useEffect(() => {
    const registerQuillModules = async () => {
      if (typeof window !== 'undefined') {
        try {
          const ReactQuillModule = await import('react-quill');
          // A robust way to get Quill, works with different module structures
          const Quill = ReactQuillModule.default?.Quill || (ReactQuillModule as any).Quill;
          
          if (Quill) {
            // Intentar registrar los módulos de alineación
            try {
              const AlignClass = Quill.import('attributors/class/align');
              const AlignStyle = Quill.import('attributors/style/align');
              
              if (AlignClass) Quill.register(AlignClass, true);
              if (AlignStyle) Quill.register(AlignStyle, true);
            } catch (alignError) {
              console.warn('Could not register alignment modules, they might be registered already:', alignError);
            }
          }
        } catch (error) {
          console.warn('Error loading Quill modules for registration:', error);
        }
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
