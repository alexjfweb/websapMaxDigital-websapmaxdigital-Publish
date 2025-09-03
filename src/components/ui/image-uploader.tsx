
"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { storageService } from '@/services/storage-service';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  onRemoveImage?: () => void;
}

export function ImageUploader({ currentImageUrl, onUploadSuccess, onRemoveImage }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Archivo demasiado grande", description: "Elige un archivo de menos de 5MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No hay archivo", description: "Selecciona un archivo para subir.", variant: "destructive" });
      return;
    }

    setStatus('uploading');
    setError(null);

    try {
      const imageUrl = await storageService.compressAndUploadFile(file);
      onUploadSuccess(imageUrl);
      setStatus('success');
      toast({ title: "¡Éxito!", description: "La imagen se ha subido correctamente." });
    } catch (err: any) {
      console.error("Upload failed in component:", err);
      setError(err.message || 'Error desconocido al subir.');
      setStatus('error');
      toast({ title: "Error de subida", description: err.message, variant: "destructive" });
    }
  };
  
  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setError(null);
    if(onRemoveImage) onRemoveImage();
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50">
        {preview ? (
          <Image src={preview} alt="Vista previa" layout="fill" objectFit="cover" className="rounded-md" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={status === 'uploading'}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Seleccionar
          </Button>
          <Input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          {file && (
            <Button size="sm" onClick={handleUpload} disabled={status === 'uploading'}>
              {status === 'uploading' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Subir
            </Button>
          )}
           {preview && (
            <Button variant="destructive" size="sm" onClick={handleRemove}>
                <Trash2 className="mr-2 h-4 w-4" /> Quitar
            </Button>
           )}
        </div>
        {status === 'error' && (
            <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
            </p>
        )}
      </div>
    </div>
  );
}
