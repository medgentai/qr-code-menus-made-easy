import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  onFileSelect,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  placeholder = 'Click to upload or drag and drop',
  isUploading = false,
  uploadProgress = 0,
  aspectRatio = 'video',
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Call the file select callback if provided
      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize, acceptedTypes, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const removeImage = () => {
    setPreview(null);
    onChange(''); // Pass empty string instead of null to avoid validation errors
  };

  // Update preview when value changes externally
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'auto':
        return '';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {preview ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className={cn("relative w-full overflow-hidden rounded-lg", getAspectRatioClass())}>
              <img
                src={preview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
              {!disabled && !isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card
          {...getRootProps()}
          className={cn(
            'cursor-pointer border-2 border-dashed transition-colors hover:border-primary/50',
            isDragActive && 'border-primary bg-primary/5',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop the image here' : placeholder}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPEG, PNG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
