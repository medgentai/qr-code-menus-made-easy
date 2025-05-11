import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVenue } from '@/contexts/venue-context';
import { useOrganization } from '@/contexts/organization-context';
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
import { toast } from '@/components/ui/sonner';
import { qrCodeService } from '@/services/qrCodeService';
import QrCodeList from '@/components/qr-codes/QrCodeList';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Edit,
  Trash2,
  Table as TableIcon,
  QrCode,
  Plus,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TableStatus, TableStatusColors, TableStatusLabels } from '@/types/venue';
import { formatDate } from '@/lib/utils';

const VenueDetails = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const {
    currentVenue,
    tables,
    isLoading,
    fetchVenueById,
    fetchTablesForVenue,
    deleteVenue
  } = useVenue();
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [isLoadingQrCodes, setIsLoadingQrCodes] = useState(true);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDetails(organizationId);
    }
  }, [organizationId, fetchOrganizationDetails]);

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId);
      fetchTablesForVenue(venueId);
    }
  }, [venueId, fetchVenueById, fetchTablesForVenue]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      if (!venueId) return;

      try {
        setIsLoadingQrCodes(true);
        const data = await qrCodeService.getQrCodesForVenue(venueId);
        setQrCodes(data);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        toast.error('Failed to load QR codes');
      } finally {
        setIsLoadingQrCodes(false);
      }
    };

    fetchQrCodes();
  }, [venueId]);

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

  const handleDeleteQrCode = async (qrCodeId: string) => {
    try {
      await qrCodeService.deleteQrCode(qrCodeId);
      setQrCodes(qrCodes.filter(qrCode => qrCode.id !== qrCodeId));
      toast.success('QR code deleted successfully');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${organizationId}/venues`)}>
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
                <li className="text-foreground font-medium">{currentVenue?.name || 'Venue'}</li>
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
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables`)}>
                  <TableIcon className="h-4 w-4 mr-2" /> Manage Tables
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => document.getElementById('delete-venue-dialog')?.click()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Venue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hidden trigger for delete dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button id="delete-venue-dialog" className="hidden">Delete</button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-9 w-40" /> : currentVenue?.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {!isLoading && (
              <Badge variant={currentVenue?.isActive ? "default" : "secondary"}>
                {currentVenue?.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
            {currentVenue?.address && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span className="text-sm">{currentVenue.address}</span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Venue Information</CardTitle>
                  <CardDescription>Details about this venue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant={currentVenue?.isActive ? "default" : "secondary"}>
                          {currentVenue?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {currentVenue?.description && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Description</div>
                          <p>{currentVenue.description}</p>
                        </div>
                      )}

                      {(currentVenue?.address || currentVenue?.city || currentVenue?.state || currentVenue?.country) && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Address</div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              {currentVenue.address && <div>{currentVenue.address}</div>}
                              {(currentVenue.city || currentVenue.state || currentVenue.postalCode) && (
                                <div>
                                  {[
                                    currentVenue.city,
                                    currentVenue.state,
                                    currentVenue.postalCode
                                  ].filter(Boolean).join(', ')}
                                </div>
                              )}
                              {currentVenue.country && <div>{currentVenue.country}</div>}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentVenue?.phoneNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Phone</div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{currentVenue.phoneNumber}</span>
                          </div>
                        </div>
                      )}

                      {currentVenue?.email && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Email</div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{currentVenue.email}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Created</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{currentVenue?.createdAt ? formatDate(new Date(currentVenue.createdAt)) : 'N/A'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Venue usage statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Tables</div>
                        <div className="font-medium">{tables.length}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">QR Codes</div>
                        <div className="font-medium">{isLoadingQrCodes ? '...' : qrCodes.length}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Total Scans</div>
                        <div className="font-medium">0</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tables">
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
          </TabsContent>

          <TabsContent value="qrcodes">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <Button
                onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/create`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create QR Code
              </Button>
            </div>
            <QrCodeList
              qrCodes={qrCodes}
              isLoading={isLoadingQrCodes}
              onDelete={handleDeleteQrCode}
              organizationId={organizationId!}
              venueId={venueId!}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VenueDetails;
