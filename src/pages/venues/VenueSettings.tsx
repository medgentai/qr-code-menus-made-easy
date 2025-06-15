import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVenue } from '@/contexts/venue-context';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Trash2,
  Settings,
  Edit,
  MoreHorizontal,
  TableIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
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
} from "@/components/ui/alert-dialog";

const VenueSettings = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const {
    currentVenue,
    isLoading,
    fetchVenueById,
    updateVenue,
    deleteVenue
  } = useVenue();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  // Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId).then(venue => {
        if (venue) {
          setIsActive(venue.isActive);
          setViewOnlyMode(venue.viewOnlyMode || false);
        }
      });
    }
  }, [venueId, fetchVenueById]);

  const handleDeleteVenue = async () => {
    if (!venueId) return;

    setIsDeleting(true);

    try {
      const success = await deleteVenue(venueId);
      if (success) {
        navigate(`/organizations/${organizationId}/venues`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!venueId) return;

    const newStatus = !isActive;
    setIsActive(newStatus);

    await updateVenue(venueId, {
      isActive: newStatus
    });
  };

  const handleToggleViewOnlyMode = async () => {
    if (!venueId) return;

    const newStatus = !viewOnlyMode;
    setViewOnlyMode(newStatus);

    await updateVenue(venueId, {
      viewOnlyMode: newStatus
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="hidden sm:block"><Link to={`/organizations/${organizationId}`}>{currentOrganization?.name}</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="hidden sm:block"><Link to={`/organizations/${organizationId}/venues`}>Venues</Link></li>
                <li className="hidden sm:block">•</li>
                <li><Link to={`/organizations/${organizationId}/venues/${venueId}`} className="truncate">{currentVenue?.name || 'Venue'}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Settings</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Venue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}>
                  <TableIcon className="h-4 w-4 mr-2" /> Venue Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables`)}>
                  <TableIcon className="h-4 w-4 mr-2" /> Manage Tables
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-9 w-40" /> : `Settings`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentVenue?.name ? `Manage settings for ${currentVenue.name}` : 'Manage settings for this venue'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage general settings for this venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Active Status</h3>
                        <p className="text-sm text-muted-foreground">
                          When a venue is inactive, it won't be visible to customers
                        </p>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={handleToggleActive}
                      />
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-orange-200 bg-orange-50/50">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">View-Only Mode</h3>
                        <p className="text-sm text-muted-foreground">
                          When enabled, customers can view menus and track orders but cannot place new orders. This overrides the organization setting.
                        </p>
                      </div>
                      <Switch
                        checked={viewOnlyMode}
                        onCheckedChange={handleToggleViewOnlyMode}
                      />
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Edit Venue</h3>
                        <p className="text-sm text-muted-foreground">
                          Update venue information and details
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/edit`)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Settings</CardTitle>
                <CardDescription>
                  Manage QR code settings for this venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">QR Code Prefix</h3>
                        <p className="text-sm text-muted-foreground">
                          Customize the URL prefix for QR codes
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled
                        className="w-full sm:w-auto"
                      >
                        Coming Soon
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">QR Code Design</h3>
                        <p className="text-sm text-muted-foreground">
                          Customize the appearance of your QR codes
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled
                        className="w-full sm:w-auto"
                      >
                        Coming Soon
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-medium">Delete Venue</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this venue and all associated tables and QR codes.
                    This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Venue
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the venue
                        and all associated tables and QR codes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteVenue}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VenueSettings;
