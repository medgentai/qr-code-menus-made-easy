import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadVenueImage } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

interface VenueImageUploadProps {
  venueId: string;
  currentImageUrl?: string | null;
  onSuccess?: (imageUrl: string) => void;
}

export const VenueImageUpload: React.FC<VenueImageUploadProps> = ({
  venueId,
  currentImageUrl,
  onSuccess,
}) => {
  const uploadVenueImage = useUploadVenueImage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [altText, setAltText] = useState<string>('');

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const result = await uploadVenueImage.mutateAsync({
        file: selectedFile,
        data: {
          venueId,
          altText: altText || 'Venue image',
        },
      });

      setImageUrl(result.url);
      setSelectedFile(null);
      setAltText('');
      
      if (onSuccess) {
        onSuccess(result.url);
      }
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleImageChange = (url: string | null) => {
    setImageUrl(url);
    if (!url) {
      setSelectedFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadField
          value={imageUrl}
          onChange={handleImageChange}
          onFileSelect={handleFileSelect}
          placeholder="Upload an image of your venue"
          isUploading={uploadVenueImage.isPending}
        />
        
        {selectedFile && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="alt-text">Image Description (Optional)</Label>
              <Input
                id="alt-text"
                placeholder="e.g., Beautiful restaurant interior"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                disabled={uploadVenueImage.isPending}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setImageUrl(currentImageUrl || null);
                  setAltText('');
                }}
                disabled={uploadVenueImage.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadVenueImage.isPending}
              >
                {uploadVenueImage.isPending ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
