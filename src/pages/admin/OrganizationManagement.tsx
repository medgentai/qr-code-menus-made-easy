import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Search, MoreHorizontal, Eye, Trash2, Building2, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { adminService, OrganizationManagement as OrgType } from '@/services/admin-service';
import { LoadingState } from '@/components/ui/loading';
import { OrganizationDetailsModal } from '@/components/admin/OrganizationDetailsModal';
import { VenuesModal } from '@/components/admin/VenuesModal';
import { MembersModal } from '@/components/admin/MembersModal';

const OrganizationManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgType | null>(null);
  const [orgDetailsOpen, setOrgDetailsOpen] = useState(false);
  const [venuesOpen, setVenuesOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  // Fetch organizations
  const {
    data: orgsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'organizations', page, search],
    queryFn: () => adminService.getAllOrganizations({
      page,
      limit: 20,
      search: search || undefined,
    }),
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Organizations data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteOrganization(orgId);
      toast.success('Organization deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete organization');
    }
  };

  const handleViewDetails = (org: OrgType) => {
    setSelectedOrg(org);
    setOrgDetailsOpen(true);
  };

  const handleViewVenues = (org: OrgType) => {
    setSelectedOrg(org);
    setVenuesOpen(true);
  };

  const handleViewMembers = (org: OrgType) => {
    setSelectedOrg(org);
    setMembersOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getTypeBadge = (type: string) => {
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

  if (isLoading) {
    return <LoadingState height="400px" message="Loading organizations..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p>Unable to load organizations</p>
          <Button variant="outline" onClick={refreshData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage organizations, venues, and business settings
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Organizations</CardTitle>
          <CardDescription>Find organizations by name or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations ({orgsData?.pagination.total || 0})</CardTitle>
          <CardDescription>
            Showing {orgsData?.organizations.length || 0} of {orgsData?.pagination.total || 0} organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgsData?.organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{org.name}</span>
                        {org.description && (
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {org.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(org.type)}</TableCell>
                    <TableCell>{getStatusBadge(org.isActive)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{org.owner?.name || 'Unknown'}</span>
                        <span className="text-sm text-muted-foreground">{org.owner?.email || 'No email'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          <span>{org.memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3 w-3" />
                          <span>{org.venueCount} venues</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{org.orderCount} orders</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(org)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewVenues(org)}>
                            <Building2 className="mr-2 h-4 w-4" />
                            View Venues
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewMembers(org)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Members
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {orgsData && orgsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {orgsData.pagination.page} of {orgsData.pagination.totalPages}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= orgsData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgsData?.pagination.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgsData?.organizations.filter(org => org.isActive).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgsData?.organizations.reduce((sum, org) => sum + org.venueCount, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgsData?.organizations.reduce((sum, org) => sum + org.orderCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        organization={selectedOrg}
        open={orgDetailsOpen}
        onOpenChange={setOrgDetailsOpen}
      />

      {/* Venues Modal */}
      <VenuesModal
        organization={selectedOrg}
        open={venuesOpen}
        onOpenChange={setVenuesOpen}
      />

      {/* Members Modal */}
      <MembersModal
        organization={selectedOrg}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
    </div>
  );
};

export default OrganizationManagement;
