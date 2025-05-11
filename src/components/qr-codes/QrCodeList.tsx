import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Eye, Edit, Trash2, QrCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode as QrCodeType } from '@/services/qrCodeService';
import { formatDistanceToNow } from 'date-fns';

interface QrCodeListProps {
  qrCodes: QrCodeType[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  organizationId: string;
  venueId: string;
}

const QrCodeList: React.FC<QrCodeListProps> = ({
  qrCodes,
  isLoading,
  onDelete,
  organizationId,
  venueId,
}) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-32 w-32 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <QrCode className="h-16 w-16 text-muted-foreground/60 mb-4" />
          <h3 className="text-lg font-medium mb-2">No QR Codes Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Generate QR codes for your venue and tables. Customers can scan these to view your digital menus.
          </p>
          <Button
            onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/create`)}
            className="w-full sm:w-auto"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Generate Your First QR Code
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{qrCode.name}</CardTitle>
                <CardDescription>
                  {qrCode.description || 'No description'}
                </CardDescription>
              </div>
              <Badge variant={qrCode.isActive ? "success" : "destructive"}>
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white p-2 rounded-md border w-32 h-32 flex items-center justify-center">
                <img
                  src={qrCode.qrCodeUrl}
                  alt={`QR Code for ${qrCode.name}`}
                  className="max-w-full max-h-full"
                />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Menu:</span>{' '}
                    {qrCode.menu?.name || 'Unknown menu'}
                  </div>
                  <div>
                    <span className="font-medium">Table:</span>{' '}
                    {qrCode.table?.name || 'No table (venue QR)'}
                  </div>
                  <div>
                    <span className="font-medium">Scan count:</span>{' '}
                    {qrCode.scanCount}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCode.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCode.id}/edit?organizationId=${organizationId}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the QR code
                          and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(qrCode.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deletingId === qrCode.id}
                        >
                          {deletingId === qrCode.id ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QrCodeList;
