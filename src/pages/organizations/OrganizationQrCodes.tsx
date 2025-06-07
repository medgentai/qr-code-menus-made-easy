import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { qrCodeService, QrCode as QrCodeType } from '@/services/qrCodeService';
import {
  Plus,
  QrCode,
  Trash2,
  MoreHorizontal,
  Building2,
  Users,
  Settings,
  Filter,
  Search,
  X,
  MapPin,
  Table as TableIcon
} from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

const OrganizationQrCodes = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const { venues, fetchVenuesForOrganization } = useVenue();
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [isLoadingQrCodes, setIsLoadingQrCodes] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    if (organizationId) {
      // Note: Organization details are automatically fetched by the organization context
      fetchVenuesForOrganization(organizationId);
    }
  }, [organizationId, fetchVenuesForOrganization]);

  // Function to fetch QR codes for all venues in the organization
  const fetchQrCodesForOrganization = async () => {
    if (!organizationId || venues.length === 0) return;

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

  // Fetch QR codes when venues are loaded
  useEffect(() => {
    if (venues.length > 0) {
      fetchQrCodesForOrganization();
    }
  }, [venues]);

  // Filter QR codes based on search and filters
  const filteredQrCodes = qrCodes.filter((qrCode) => {
    // Search filter
    const matchesSearch = !searchTerm ||
      qrCode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qrCode.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qrCode.table?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venues.find(v => v.id === qrCode.venueId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Venue filter
    const matchesVenue = venueFilter === 'all' || qrCode.venueId === venueFilter;

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && qrCode.isActive) ||
      (statusFilter === 'inactive' && !qrCode.isActive);

    return matchesSearch && matchesVenue && matchesStatus;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setVenueFilter('all');
    setStatusFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || venueFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage QR codes for {currentOrganization?.name || 'your organization'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (venues.length === 0) {
                toast.error('You need to create a venue first before generating QR codes');
                navigate(`/organizations/${organizationId}/venues/create`);
              } else {
                // Navigate to QR code creation page for the first venue
                navigate(`/organizations/${organizationId}/venues/${venues[0].id}/qrcodes/create?organizationId=${organizationId}`);
              }
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Create QR Code</span>
            <span className="inline sm:hidden">Create</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}`)}>
                <Building2 className="h-4 w-4 mr-2" /> Organization Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues`)}>
                <Building2 className="h-4 w-4 mr-2" /> Manage Venues
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

      <Separator />

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search QR codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Venue Filter */}
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredQrCodes.length} of {qrCodes.length} QR codes
            {hasActiveFilters && ' (filtered)'}
          </span>
        </div>
      </div>

      {isLoadingQrCodes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : filteredQrCodes.length === 0 ? (
        qrCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <QrCode className="h-16 w-16 text-muted-foreground/60 mb-4" />
            <h3 className="text-lg font-medium mb-2">No QR Codes Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Generate QR codes for your venues and menus. Customers can scan these to view your digital menus.
            </p>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                if (venues.length === 0) {
                  toast.error('You need to create a venue first before generating QR codes');
                  navigate(`/organizations/${organizationId}/venues/create`);
                } else {
                  // Navigate to QR code creation page for the first venue
                  navigate(`/organizations/${organizationId}/venues/${venues[0].id}/qrcodes/create?organizationId=${organizationId}`);
                }
              }}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate Your First QR Code
            </Button>
          </CardContent>
        </Card>
        ) : (
          // No results after filtering
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Filter className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">No QR Codes Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                No QR codes match your current filters. Try adjusting your search criteria.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQrCodes.map((qrCode) => {
            const venue = venues.find(v => v.id === qrCode.venueId);
            const isTableQr = !!qrCode.table;

            return (
            <Card key={qrCode.id} className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isTableQr ? (
                        <TableIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-green-600" />
                      )}
                      <Badge variant={isTableQr ? "default" : "secondary"} className="text-xs">
                        {isTableQr ? "Table QR" : "Venue QR"}
                      </Badge>
                      <Badge variant={qrCode.isActive ? "default" : "secondary"} className="text-xs">
                        {qrCode.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {qrCode.description || 'No description provided'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-white p-3 rounded-lg border w-28 h-28 flex items-center justify-center shadow-sm">
                    <img
                      src={qrCode.qrCodeUrl}
                      alt={`QR Code for ${qrCode.name}`}
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Location Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{venue?.name || 'Unknown venue'}</span>
                      </div>
                      {isTableQr && (
                        <div className="flex items-center gap-2 ml-6">
                          <TableIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{qrCode.table?.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium">{qrCode.scanCount}</span> scans
                      </span>
                      <span>
                        Created {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/organizations/${organizationId}/venues/${qrCode.venueId}/qrcodes/${qrCode.id}?organizationId=${organizationId}`)}
                >
                  View QR Code
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrganizationQrCodes;
