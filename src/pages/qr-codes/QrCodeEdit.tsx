import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import EditQrCodeForm from '@/components/qr-codes/EditQrCodeForm';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { qrCodeService, QrCode } from '@/services/qrCodeService';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const QrCodeEdit: React.FC = () => {
  // Get parameters from both URL params and query params
  const { id, venueId, qrCodeId } = useParams<{ id: string; venueId: string; qrCodeId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const organizationId = queryParams.get('organizationId') || id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const { currentVenue, tables, fetchVenueById, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails(organizationId);
    }
  }, [organizationId, fetchOrganizationDetails]);

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId || !venueId || !qrCodeId) {
        toast.error('Missing required parameters');
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);

        // Fetch QR code details
        const qrCodeData = await qrCodeService.getQrCode(qrCodeId);
        setQrCode(qrCodeData);

        // Fetch venue details
        await fetchVenueById(venueId);

        // Fetch menus for the organization
        await fetchMenusForOrganization(organizationId);

        // Fetch tables for the venue
        await fetchTablesForVenue(venueId);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
        navigate(`/organizations/${organizationId}?activeTab=qrcodes`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId, venueId, qrCodeId, navigate, fetchVenueById, fetchMenusForOrganization, fetchTablesForVenue]);

  const handleSuccess = () => {
    toast.success('QR code updated successfully');
    navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCodeId}?organizationId=${organizationId}`);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCodeId}?organizationId=${organizationId}`)}
            className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <Breadcrumb className="mb-2">
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
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCodeId}?organizationId=${organizationId}`}>
                      {qrCode?.name || 'QR Code'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Edit</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Edit QR Code</h1>
            {!isLoading && currentVenue && qrCode && (
              <p className="text-muted-foreground mt-1 text-sm">
                Update QR code "{qrCode.name}" for {currentVenue.name}
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Details</CardTitle>
            <CardDescription>
              Update the details of this QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !qrCode ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <EditQrCodeForm
                qrCode={qrCode}
                venueId={venueId!}
                menus={menus}
                tables={tables}
                onSuccess={handleSuccess}
              />
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default QrCodeEdit;
