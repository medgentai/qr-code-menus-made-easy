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
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import CreateQrCodeForm from '@/components/qr-codes/CreateQrCodeForm';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const QrCodeCreate: React.FC = () => {
  // Get parameters from both URL params and query params
  const { id, venueId } = useParams<{ id: string; venueId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const organizationId = queryParams.get('organizationId') || id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const { currentVenue, tables, fetchVenueById, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId || !venueId) {
        toast.error('Missing organization or venue ID');
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);

        // Fetch venue details
        await fetchVenueById(venueId);

        // Fetch menus for the organization
        await fetchMenusForOrganization(organizationId);

        // Fetch tables for the venue
        await fetchTablesForVenue(venueId);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId, venueId, navigate, fetchVenueById, fetchMenusForOrganization, fetchTablesForVenue]);

  const handleSuccess = (qrCodeId: string) => {
    navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/${qrCodeId}`);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
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
                  <BreadcrumbLink>Create QR Code</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Create QR Code</h1>
            {!isLoading && currentVenue && (
              <p className="text-muted-foreground mt-1 text-sm">
                Create a new QR code for {currentVenue.name}
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Details</CardTitle>
            <CardDescription>
              Fill in the details to generate a new QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <CreateQrCodeForm
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

export default QrCodeCreate;
