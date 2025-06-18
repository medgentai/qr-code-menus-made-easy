import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { toast } from 'sonner';
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

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  QrCode,
  Settings,
  Users,
  Utensils,
  Hotel,
  Coffee,
  Truck,
  Wine,
  Store,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationType, OrganizationTypeLabels } from '@/types/organization';
import { qrCodeService, QrCode as QrCodeType } from '@/services/qrCodeService';

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentOrganizationDetails,
    fetchOrganizationDetails,
    isLoading,
    selectOrganization,
    organizations,
    deleteOrganization
  } = useOrganization();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { venues, fetchVenuesForOrganization } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();

  // QR code related state
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [isLoadingQrCodes, setIsLoadingQrCodes] = useState(false);

  useEffect(() => {
    if (id) {
      // Find the organization in the list and select it
      const org = organizations.find(o => o.id === id);
      if (org) {
        selectOrganization(org);
      }

      // Fetch venues and menus for this organization
      fetchVenuesForOrganization(id);
      fetchMenusForOrganization(id);
    }
  }, [id, organizations, selectOrganization, fetchVenuesForOrganization, fetchMenusForOrganization]);

  // Function to fetch QR codes for all venues in the organization
  const fetchQrCodesForOrganization = async () => {
    if (!id || venues.length === 0) return;

    try {
      setIsLoadingQrCodes(true);

      // Fetch QR codes for each venue and combine them
      const allQrCodes: QrCodeType[] = [];

      for (const venue of venues) {
        const venueQrCodes = await qrCodeService.getQrCodesForVenue(venue.id);
        allQrCodes.push(...venueQrCodes);
      }

      setQrCodes(allQrCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setIsLoadingQrCodes(false);
    }
  };

  // Function to handle QR code deletion
  const handleDeleteQrCode = async (qrCodeId: string) => {
    try {
      await qrCodeService.deleteQrCode(qrCodeId);
      toast.success('QR code deleted successfully');
      // Refresh QR codes
      fetchQrCodesForOrganization();
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };

  // Fetch QR codes when venues are loaded (for statistics display)
  useEffect(() => {
    if (venues.length > 0) {
      fetchQrCodesForOrganization();
    }
  }, [venues]);



  // Function to get the appropriate icon based on organization type
  const getOrganizationIcon = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.RESTAURANT:
        return <Utensils className="h-5 w-5" />;
      case OrganizationType.HOTEL:
        return <Hotel className="h-5 w-5" />;
      case OrganizationType.CAFE:
        return <Coffee className="h-5 w-5" />;
      case OrganizationType.FOOD_TRUCK:
        return <Truck className="h-5 w-5" />;
      case OrganizationType.BAR:
        return <Wine className="h-5 w-5" />;
      default:
        return <Store className="h-5 w-5" />;
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading || !currentOrganizationDetails) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/organizations')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm breadcrumbs">
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
          <Separator />

          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-32 mt-1" />
            </div>
          </div>

          <Separator />

          <Skeleton className="h-10 w-full max-w-md" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-optimized header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="text-foreground font-medium truncate">
                  {currentOrganizationDetails.name}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/organizations/${id}/venues`)}
              className="flex-1 sm:flex-none"
            >
              <MapPin className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline sm:hidden">Venues</span>
              <span className="inline xs:hidden sm:inline">Manage Venues</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/organizations/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Organization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${id}/members`)}>
                  <Users className="h-4 w-4 mr-2" /> Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${id}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile-optimized organization header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            {currentOrganizationDetails.logoUrl ? (
              <AvatarImage src={currentOrganizationDetails.logoUrl} alt={currentOrganizationDetails.name} />
            ) : (
              <AvatarFallback>
                {getInitials(currentOrganizationDetails.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  {currentOrganizationDetails.name}
                </h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm sm:text-base">
                  {getOrganizationIcon(currentOrganizationDetails.type)}
                  <span>{OrganizationTypeLabels[currentOrganizationDetails.type]}</span>
                </p>
              </div>
              <Badge variant={currentOrganizationDetails.isActive ? "default" : "secondary"} className="flex-shrink-0">
                {currentOrganizationDetails.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Removed redundant tabs - content now focuses on overview only */}
        <div className="space-y-4 sm:space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Organization Details</CardTitle>
                  <CardDescription className="text-sm">
                    Basic information about {currentOrganizationDetails.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentOrganizationDetails.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentOrganizationDetails.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Organization ID</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate" title={currentOrganizationDetails.id}>
                        {currentOrganizationDetails.id}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Slug</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentOrganizationDetails.slug}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Created</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{new Date(currentOrganizationDetails.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{new Date(currentOrganizationDetails.updatedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    {currentOrganizationDetails.websiteUrl && (
                      <div className="sm:col-span-2">
                        <h3 className="text-sm font-medium mb-1">Website</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          <a
                            href={currentOrganizationDetails.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                            title={currentOrganizationDetails.websiteUrl}
                          >
                            {currentOrganizationDetails.websiteUrl.replace(/^https?:\/\//, '')}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Statistics</CardTitle>
                  <CardDescription className="text-sm">
                    Key metrics for this organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Members</span>
                    </div>
                    <Badge variant="outline">
                      {currentOrganizationDetails.stats.totalMembers}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Venues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalVenues || 0}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigate(`/organizations/${id}/venues`)}
                        title="Manage Venues"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Menus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {menus.length || currentOrganizationDetails.stats.totalMenus || 0}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigate(`/organizations/${id}/menus`)}
                        title="Manage Menus"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">QR Codes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {qrCodes.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigate(`/organizations/${id}/qrcodes`)}
                        title="Manage QR Codes"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile-optimized team members section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
              <CardDescription className="text-sm">
                People with access to this organization
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {currentOrganizationDetails.members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {member.user.profileImageUrl ? (
                          <AvatarImage src={member.user.profileImageUrl} alt={member.user.name} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'} className="self-start sm:self-center flex-shrink-0 text-xs">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="px-3 sm:px-6">
              <Button
                variant="outline"
                className="w-full sm:w-auto sm:mx-auto"
                onClick={() => navigate(`/organizations/${id}/members`)}
              >
                <Users className="h-4 w-4 mr-2" />
                View All Members
              </Button>
            </CardFooter>
          </Card>





        </div>
      </div>

      {/* Delete Organization Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this organization?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization
              and all associated data including venues, menus, and QR codes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (id) {
                  const isDeleted = await deleteOrganization(id);
                  if (isDeleted) {
                    toast.success('Organization deleted successfully');
                    navigate('/organizations');
                  } else {
                    toast.error('Failed to delete organization');
                  }
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrganizationDetails;
