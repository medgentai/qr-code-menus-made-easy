import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadOrganizationLogo } from '@/hooks/useImageUpload';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

interface OrganizationLogoUploadProps {
  organizationId: string;
  currentLogoUrl?: string | null;
  onSuccess?: (logoUrl: string) => void;
}

export const OrganizationLogoUpload: React.FC<OrganizationLogoUploadProps> = ({
  organizationId,
  currentLogoUrl,
  onSuccess,
}) => {
  const { user } = useAuth();
  const uploadLogo = useUploadOrganizationLogo();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }

    try {
      const result = await uploadLogo.mutateAsync({
        file: selectedFile,
        organizationId,
        data: {
          altText: 'Organization logo',
        },
      });

      setLogoUrl(result.url);
      setSelectedFile(null);
      
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

  const handleLogoChange = (url: string | null) => {
    setLogoUrl(url);
    if (!url) {
      setSelectedFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadField
          value={logoUrl}
          onChange={handleLogoChange}
          onFileSelect={handleFileSelect}
          placeholder="Upload your organization logo"
          isUploading={uploadLogo.isPending}
          maxSize={5 * 1024 * 1024} // 5MB limit for logos
        />
        
        {selectedFile && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setLogoUrl(currentLogoUrl || null);
              }}
              disabled={uploadLogo.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadLogo.isPending}
            >
              {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
