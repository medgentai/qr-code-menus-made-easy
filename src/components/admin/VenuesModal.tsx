import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Search, Users, QrCode, Clock } from 'lucide-react';
import { OrganizationManagement, OrganizationVenuesResponse, adminService } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';
import { toast } from 'sonner';

interface VenuesModalProps {
  organization: OrganizationManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VenuesModal: React.FC<VenuesModalProps> = ({
  organization,
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [venuesData, setVenuesData] = useState<OrganizationVenuesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && organization) {
      fetchVenues();
    }
  }, [open, organization]);

  const fetchVenues = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      const data = await adminService.getOrganizationVenues(organization.id);
      setVenuesData(data);
    } catch (error) {
      toast.error('Failed to fetch venues');
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!organization) return null;

  const venues = venuesData?.venues || [];
  const filteredVenues = venues.filter(venue =>
    venue.name?.toLowerCase().includes(search.toLowerCase()) ||
    (venue.address && venue.address.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeBadge = (type: string) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;

    const colors = {
      RESTAURANT: 'bg-blue-100 text-blue-800',
      HOTEL: 'bg-purple-100 text-purple-800',
      CAFE: 'bg-orange-100 text-orange-800',
      FOOD_TRUCK: 'bg-green-100 text-green-800',
      BAR: 'bg-red-100 text-red-800',
    };

    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || ''}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Venues - {organization.name}
          </DialogTitle>
          <DialogDescription>
            Manage venues for {organization.name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingState height="400px" message="Loading venues..." />
        ) : (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{venues.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {venues.reduce((sum, venue) => sum + (venue.tableCount || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {venues.reduce((sum, venue) => sum + (venue.tableCount || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {venues.reduce((sum, venue) => sum + (venue.orderCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Venues Table */}
          <Card>
            <CardHeader>
              <CardTitle>Venues ({filteredVenues.length})</CardTitle>
              <CardDescription>
                All venues under {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venue Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Tables</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVenues.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{venue.name || 'Unnamed Venue'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(venue.type)}</TableCell>
                        <TableCell>{getStatusBadge(venue.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{venue.address || 'No address'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{venue.tableCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{venue.orderCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {venue.createdAt ? new Date(venue.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredVenues.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No venues found</p>
                  {search && (
                    <p className="text-sm">Try adjusting your search criteria</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
