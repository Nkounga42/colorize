import React, { useCallback, useState } from 'react';

type Props = {
  onImageClick?: (url: string) => void;
};

const ImageDropZone = ({ onImageClick }: Props) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...urls]);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = (indexToDelete: number) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[indexToDelete]);
      return prev.filter((_, index) => index !== indexToDelete);
    });
  };

  return (
    <div className="rounded-md">
      <div
        onDrop={handleDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onDragLeave={preventDefaults}
        className="relative p-4 border text-center h-40 bg-base-300/70 justify-center border-dashed border-3 border-base-content/30 hover:border-primary hover:text-primary hover:bg-primary/10 rounded-xl flex flex-col items-center text-base-content"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <p>Glissez-déposez une image ici ou cliquez</p>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative border rounded overflow-hidden group">
              <img
                src={src}
                alt={`image-${index}`}
                className="w-full h-32 object-cover cursor-pointer aspect-ratio"
                onClick={() => onImageClick?.(src)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', src);
                }}
              />
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
