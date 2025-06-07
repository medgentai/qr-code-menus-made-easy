import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Edit, Trash2, BarChart, ArrowLeft } from 'lucide-react';
import QrCodeDisplay from '@/components/qr-codes/QrCodeDisplay';
import { qrCodeService } from '@/services/qrCodeService';
import { formatDistanceToNow, format } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';

const QrCodeDetails: React.FC = () => {
  // Get parameters from both URL params and query params
  const { id, venueId, qrCodeId } = useParams<{
    id: string;
    venueId: string;
    qrCodeId: string;
  }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const organizationId = queryParams.get('organizationId') || id;
  const navigate = useNavigate();

  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const { currentVenue, fetchVenueById } = useVenue();

  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId);
    }
  }, [venueId, fetchVenueById]);

  useEffect(() => {
    const fetchQrCode = async () => {
      if (!qrCodeId) {
        toast.error('Missing QR code ID');
        navigate(`/organizations/${organizationId}/qrcodes`);
        return;
      }

      try {
        setIsLoading(true);
        const data = await qrCodeService.getQrCode(qrCodeId);
        setQrCode(data);
      } catch (error) {
        console.error('Error fetching QR code:', error);
        toast.error('Failed to load QR code details');
        navigate(`/organizations/${organizationId}/qrcodes`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [qrCodeId, organizationId, venueId, navigate]);

  const handleDelete = async () => {
    if (!qrCodeId) return;

    try {
      setIsDeleting(true);
      await qrCodeService.deleteQrCode(qrCodeId);
      toast.success('QR code deleted successfully');
      navigate(`/organizations/${organizationId}/qrcodes`);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/organizations">Organizations</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/organizations/${organizationId}`}>
                        {currentOrganization?.name || 'Organization'}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/organizations/${organizationId}/venues`}>Venues</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/organizations/${organizationId}/venues/${venueId}`}>
                        {currentVenue?.name || 'Venue'}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink>QR Code</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          {!isLoading && qrCode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCodeId}/edit?organizationId=${organizationId}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
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
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoading ? 'QR Code Details' : qrCode?.name}
          </h1>
          {!isLoading && qrCode && (
            <p className="text-muted-foreground mt-1">
              {qrCode.description || 'No description'}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : qrCode ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QrCodeDisplay
                  value={qrCode.qrCodeData}
                  size={250}
                  title={qrCode.name}
                  description={qrCode.description}
                  isActive={qrCode.isActive}
                  scanCount={qrCode.scanCount}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Information</CardTitle>
                    <CardDescription>Details about this QR code</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant={qrCode.isActive ? "success" : "destructive"}>
                          {qrCode.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Venue:</span>
                        <span>{qrCode.venue?.name || 'Unknown venue'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Menu:</span>
                        <span>{qrCode.menu?.name || 'Unknown menu'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Table:</span>
                        <span>{qrCode.table?.name || 'No table (venue QR)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Scan count:</span>
                        <span>{qrCode.scanCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span title={format(new Date(qrCode.createdAt), 'PPpp')}>
                          {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last updated:</span>
                        <span title={format(new Date(qrCode.updatedAt), 'PPpp')}>
                          {formatDistanceToNow(new Date(qrCode.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <div className="w-full">
                      <h4 className="font-medium mb-2">QR Code URL</h4>
                      <div className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                        <code>{qrCode.qrCodeData}</code>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Scan Analytics
                  </CardTitle>
                  <CardDescription>
                    View statistics about this QR code's usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <BarChart className="h-16 w-16 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                      We're working on detailed analytics for your QR codes. For now, you can see the total scan count.
                    </p>
                    <div className="text-3xl font-bold">{qrCode.scanCount}</div>
                    <div className="text-sm text-muted-foreground">Total scans</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p>QR code not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default QrCodeDetails;
