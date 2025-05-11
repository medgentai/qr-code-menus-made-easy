import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { toast } from '@/components/ui/sonner';
import DashboardLayout from '@/components/layouts/dashboard-layout';
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
  BarChart,
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { venues, fetchVenuesForOrganization } = useVenue();

  useEffect(() => {
    if (id) {
      // Find the organization in the list and select it
      const org = organizations.find(o => o.id === id);
      if (org) {
        selectOrganization(org);
      }

      // Fetch venues for this organization
      fetchVenuesForOrganization(id);
    }
  }, [id, organizations, selectOrganization, fetchVenuesForOrganization]);

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
      <DashboardLayout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/organizations')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">{currentOrganizationDetails.name}</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/organizations/${id}/venues`)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Manage Venues</span>
              <span className="inline sm:hidden">Venues</span>
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

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            {currentOrganizationDetails.logoUrl ? (
              <AvatarImage src={currentOrganizationDetails.logoUrl} alt={currentOrganizationDetails.name} />
            ) : (
              <AvatarFallback>
                {getInitials(currentOrganizationDetails.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                {currentOrganizationDetails.name}
              </h1>
              <Badge variant={currentOrganizationDetails.isActive ? "default" : "secondary"}>
                {currentOrganizationDetails.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              {getOrganizationIcon(currentOrganizationDetails.type)}
              <span>{OrganizationTypeLabels[currentOrganizationDetails.type]}</span>
            </p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-auto pb-1">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-full lg:w-auto lg:min-w-0">
              <TabsTrigger value="overview" className="text-sm sm:text-base">Overview</TabsTrigger>
              <TabsTrigger value="venues" className="text-sm sm:text-base">Venues</TabsTrigger>
              <TabsTrigger value="menus" className="text-sm sm:text-base">Menus</TabsTrigger>
              <TabsTrigger value="qrcodes" className="text-sm sm:text-base">QR Codes</TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm sm:text-base">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
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
                        <p className="text-sm text-muted-foreground font-mono truncate" title={currentOrganizationDetails.id}>
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
                          <Calendar className="h-3 w-3" />
                          {new Date(currentOrganizationDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(currentOrganizationDetails.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {currentOrganizationDetails.websiteUrl && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Website</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 w-full">
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
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>
                      Key metrics for this organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Members</span>
                      </div>
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalMembers}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Venues</span>
                      </div>
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalVenues || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Menus</span>
                      </div>
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalMenus || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">QR Codes</span>
                      </div>
                      <Badge variant="outline">
                        {currentOrganizationDetails.stats.totalQrCodes || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  People with access to this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrganizationDetails.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-2 rounded-md border">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
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
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[250px] md:max-w-full">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'} className="mt-1 sm:mt-0 self-start sm:self-center flex-shrink-0">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
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
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Venues</CardTitle>
                  <CardDescription>
                    Manage your physical locations
                  </CardDescription>
                </div>
                <Button
                  onClick={() => navigate(`/organizations/${id}/venues/create`)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Venue
                </Button>
              </CardHeader>
              <CardContent>
                {venues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MapPin className="h-16 w-16 text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Venues Yet</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venues.map((venue) => (
                      <div key={venue.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{venue.name}</h3>
                          <Badge variant={venue.isActive ? "default" : "secondary"}>
                            {venue.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {venue.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {venue.description}
                          </p>
                        )}
                        {venue.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/organizations/${id}/venues/${venue.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/organizations/${id}/venues`)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage All Venues
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="menus">
            <Card>
              <CardHeader>
                <CardTitle>Menus</CardTitle>
                <CardDescription>
                  Manage your digital menus
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Utensils className="h-16 w-16 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Menus Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Create digital menus for your venues. Add categories, items, and customize your menu appearance.
                </p>
                <Button className="w-full sm:w-auto">
                  <Utensils className="h-4 w-4 mr-2" />
                  Create Your First Menu
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcodes">
            <Card>
              <CardHeader>
                <CardTitle>QR Codes</CardTitle>
                <CardDescription>
                  Generate and manage QR codes for your venues
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <QrCode className="h-16 w-16 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-medium mb-2">No QR Codes Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Generate QR codes for your venues and menus. Customers can scan these to view your digital menus.
                </p>
                <Button className="w-full sm:w-auto">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Your First QR Code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View insights and statistics for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BarChart className="h-16 w-16 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Track menu views, popular items, and customer engagement. Analytics will be available once you have active menus and QR codes.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  <BarChart className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
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
    </DashboardLayout>
  );
};

export default OrganizationDetails;
