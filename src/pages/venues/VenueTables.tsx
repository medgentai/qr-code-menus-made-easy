import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVenue } from '@/contexts/venue-context';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  TableIcon,
  QrCode,
  MoreHorizontal,
  Settings,
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { TableStatus, TableStatusColors, TableStatusLabels } from '@/types/venue';
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

const VenueTables = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const {
    currentVenue,
    tables,
    isLoading,
    fetchVenueById,
    fetchTablesForVenue,
    deleteTable
  } = useVenue();

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId);
      fetchTablesForVenue(venueId);
    }
  }, [venueId, fetchVenueById, fetchTablesForVenue]);

  const handleDeleteTable = async (tableId: string) => {
    await deleteTable(tableId);
    // Refresh tables after deletion
    fetchTablesForVenue(venueId!);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}`}>{currentOrganization?.name}</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/venues`}>Venues</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/venues/${venueId}`}>{currentVenue?.name || 'Venue'}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Tables</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
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
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-9 w-40" /> : `Tables`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentVenue?.name ? `Manage tables for ${currentVenue.name}` : 'Manage tables for this venue'}
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Manage tables for this venue</CardDescription>
            </div>
            <Button
              onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/create`)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Table
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <TableIcon className="h-16 w-16 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Tables Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Add tables to your venue to start generating QR codes for them.
                </p>
                <Button onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/create`)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Your First Table
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Capacity</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Location</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{table.name}</td>
                        <td className="py-3 px-4">{table.capacity || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge className={TableStatusColors[table.status]}>
                            {TableStatusLabels[table.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{table.location || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/${table.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/${table.id}/qrcode`)}
                            >
                              QR Code
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the table
                                    and any associated QR codes.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTable(table.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default VenueTables;
