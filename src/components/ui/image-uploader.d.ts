
"use client";
import React from 'react';
interface ImageUploaderProps {
    currentImageUrl?: string;
    onUploadSuccess: (url: string) => void;
    onRemoveImage?: () => void;
}
export declare function ImageUploader({ currentImageUrl, onUploadSuccess, onRemoveImage }: ImageUploaderProps): React.JSX.Element;
export {};
