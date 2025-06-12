import React, { useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { OrganizationType } from '@/types/organization';
import {
  Building2,
  Plus,
  Settings,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  Table as TableIcon,
  QrCode,
  MoreHorizontal,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const VenueList = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { currentOrganization, currentOrganizationDetails, fetchOrganizationDetails } = useOrganization();
  const { venues, isLoading, fetchVenuesForOrganization } = useVenue();

  // Check if we're coming from payment success and force refresh
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromPayment = searchParams.get('from') === 'payment';

    if (fromPayment && organizationId) {
      // Force refresh venue data when coming from payment
      queryClient.invalidateQueries({
        queryKey: ['venues', 'organization', organizationId]
      });

      // Remove the query parameter to prevent repeated refreshes
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location, organizationId, queryClient]);

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  // No need for a separate effect to fetch venues - the VenueContext will handle this

  // Check if current organization is a food truck
  const isFoodTruck = currentOrganizationDetails?.type === OrganizationType.FOOD_TRUCK;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${organizationId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li><Link to={`/organizations/${organizationId}`} className="truncate">{currentOrganization?.name || 'Organization'}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Venues</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
            <Button
              onClick={() => navigate(`/organizations/${organizationId}/venues/create`)}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Create Venue</span>
              <span className="inline sm:hidden">Create</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}`)}>
                  <Building2 className="h-4 w-4 mr-2" /> Organization Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/members`)}>
                  <Users className="h-4 w-4 mr-2" /> Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" /> Organization Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground mt-1">
            Manage venues for {currentOrganization?.name || 'your organization'}
          </p>
        </div>

        <Separator />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="h-32 sm:h-40 bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <Skeleton className="h-9 w-full sm:w-24" />
                    <Skeleton className="h-9 w-full sm:w-24" />
                  </div>
                  <Skeleton className="h-9 w-full sm:w-24 mt-2 sm:mt-0" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Venues Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {isFoodTruck
                  ? "Create your first mobile location to start managing QR codes for your food truck."
                  : "Create your first venue to start managing tables and QR codes for your business."
                }
              </p>
              <Button onClick={() => navigate(`/organizations/${organizationId}/venues/create`)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Venue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {venues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-0">
                  <div className="h-32 sm:h-40 bg-muted flex items-center justify-center overflow-hidden">
                    {venue.imageUrl ? (
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground/40" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold truncate">{venue.name}</h3>
                    <Badge variant={venue.isActive ? "default" : "secondary"} className="flex-shrink-0">
                      {venue.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {venue.description && (
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {venue.description}
                    </p>
                  )}
                  <div className="space-y-1.5 sm:space-y-2">
                    {venue.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {venue.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{venue.phoneNumber}</span>
                      </div>
                    )}
                    {venue.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{venue.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className={`grid gap-2 w-full ${isFoodTruck ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {!isFoodTruck && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizations/${organizationId}/venues/${venue.id}/tables`)}
                        className="w-full"
                      >
                        <TableIcon className="h-4 w-4 mr-1" /> Tables
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/organizations/${organizationId}/venues/${venue.id}/settings`)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venue.id}`)}
                    className="w-full"
                  >
                    View Details <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default VenueList;
