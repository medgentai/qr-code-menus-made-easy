import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('activeTab');

  const {
    currentOrganizationDetails,
    fetchOrganizationDetails,
    isLoading,
    selectOrganization,
    organizations,
    deleteOrganization
  } = useOrganization();
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'overview');
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

  // Also fetch QR codes when the QR codes tab becomes active (for real-time updates)
  useEffect(() => {
    if (venues.length > 0 && activeTab === 'qrcodes') {
      fetchQrCodesForOrganization();
    }
  }, [activeTab]);

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
      case OrganizationType.OTHER:
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

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile-optimized tabs */}
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-full lg:w-auto lg:min-w-0 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm lg:text-base px-3 py-2 whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="venues" className="text-xs sm:text-sm lg:text-base px-3 py-2 whitespace-nowrap">
                Venues
              </TabsTrigger>
              <TabsTrigger value="menus" className="text-xs sm:text-sm lg:text-base px-3 py-2 whitespace-nowrap">
                Menus
              </TabsTrigger>
              <TabsTrigger value="qrcodes" className="text-xs sm:text-sm lg:text-base px-3 py-2 whitespace-nowrap">
                QR Codes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
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
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalVenues || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">Menus</span>
                      </div>
                      <Badge variant="outline">
                        {menus.length || currentOrganizationDetails.stats.totalMenus || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">QR Codes</span>
                      </div>
                      <Badge variant="outline">
                        {qrCodes.length}
                      </Badge>
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
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Venues</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your physical locations
                  </CardDescription>
                </div>
                <Button
                  onClick={() => navigate(`/organizations/${id}/venues/create`)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Venue
                </Button>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {venues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-center">No Venues Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                      Venues represent your physical locations. Add your first venue to start creating menus and QR codes.
                    </p>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => navigate(`/organizations/${id}/venues/create`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Venue
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {venues.map((venue) => (
                      <div key={venue.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                          <h3 className="font-medium truncate">{venue.name}</h3>
                          <Badge variant={venue.isActive ? "default" : "secondary"} className="self-start">
                            {venue.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {venue.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {venue.description}
                          </p>
                        )}
                        {venue.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span className="break-words">
                              {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/organizations/${id}/venues/${venue.id}`)}
                            className="w-full sm:w-auto"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center px-3 sm:px-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/organizations/${id}/venues`)}
                  className="w-full sm:w-auto"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage All Venues
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="menus">
            {/* Mobile-optimized menus header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Menus</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your digital menus for {currentOrganizationDetails.name}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => navigate(`/organizations/${id}/menus/create`)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline sm:hidden">Create</span>
                  <span className="inline xs:hidden sm:inline">Create Menu</span>
                </Button>
                <Button variant="outline" onClick={() => navigate(`/organizations/${id}/menus`)} className="w-full sm:w-auto">
                  <Utensils className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline sm:hidden">View</span>
                  <span className="inline xs:hidden sm:inline">View All</span>
                </Button>
              </div>
            </div>

            {menus.length === 0 ? (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Digital Menus</CardTitle>
                  <CardDescription className="text-sm">
                    Create and manage digital menus for your venues
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <Utensils className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-center">Streamline Your Menu Management</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                      Create digital menus for your venues. Add categories, items, and customize your menu appearance.
                      Customers can scan QR codes to view your menus on their devices.
                    </p>
                    <Button onClick={() => navigate(`/organizations/${id}/menus/create`)} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menus.map((menu) => (
                  <Card key={menu.id} className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                        <CardTitle className="text-lg truncate">{menu.name}</CardTitle>
                        <Badge variant={menu.isActive ? "default" : "secondary"} className="self-start">
                          {menu.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {menu.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{menu.categories?.length || 0} categories</span>
                        <span>•</span>
                        <span>
                          {menu.categories?.reduce((total, cat) => total + (cat.items?.length || 0), 0) || 0} items
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/organizations/${id}/menus/${menu.id}`)}
                      >
                        View Menu
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qrcodes">
            {/* Mobile-optimized QR codes header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">QR Codes</h2>
                <p className="text-sm text-muted-foreground">
                  Generate and manage QR codes for your venues
                </p>
              </div>
              <Button
                onClick={() => {
                  if (venues.length === 0) {
                    toast.error('You need to create a venue first before generating QR codes');
                    navigate(`/organizations/${id}/venues/create`);
                  } else {
                    // Navigate to QR code creation page for the first venue
                    navigate(`/organizations/${id}/venues/${venues[0].id}/qrcodes/create?organizationId=${id}`);
                  }
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline sm:hidden">Create</span>
                <span className="inline xs:hidden sm:inline">Create QR Code</span>
              </Button>
            </div>

            {isLoadingQrCodes ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
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
            ) : qrCodes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 px-3 sm:px-6">
                  <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/60 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-center">No QR Codes Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Generate QR codes for your venues and menus. Customers can scan these to view your digital menus.
                  </p>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (venues.length === 0) {
                        toast.error('You need to create a venue first before generating QR codes');
                        navigate(`/organizations/${id}/venues/create`);
                      } else {
                        // Navigate to QR code creation page for the first venue
                        navigate(`/organizations/${id}/venues/${venues[0].id}/qrcodes/create?organizationId=${id}`);
                      }
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Your First QR Code
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {qrCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                        <CardTitle className="text-lg truncate">{qrCode.name}</CardTitle>
                        <Badge variant={qrCode.isActive ? "default" : "secondary"} className="self-start">
                          {qrCode.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {qrCode.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white p-2 rounded-md border w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                          <img
                            src={qrCode.qrCodeUrl}
                            alt={`QR Code for ${qrCode.name}`}
                            className="max-w-full max-h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Venue:</span>{' '}
                              <span className="truncate">{venues.find(v => v.id === qrCode.venueId)?.name || 'Unknown venue'}</span>
                            </div>
                            <div>
                              <span className="font-medium">Table:</span>{' '}
                              <span className="truncate">{qrCode.table?.name || 'No table (venue QR)'}</span>
                            </div>
                            <div>
                              <span className="font-medium">Scan count:</span>{' '}
                              {qrCode.scanCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 sm:flex-row pt-0">
                      <Button
                        size="sm"
                        className="w-full sm:flex-1"
                        onClick={() => navigate(`/organizations/${id}/venues/${qrCode.venueId}/qrcodes/${qrCode.id}?organizationId=${id}`)}
                      >
                        View QR Code
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                            <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Delete</span>
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
                              onClick={() => handleDeleteQrCode(qrCode.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>


        </Tabs>
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
