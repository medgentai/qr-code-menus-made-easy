import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { qrCodeService } from '@/services/qrCodeService';
import QrCodeList from '@/components/qr-codes/QrCodeList';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Table as TableIcon,
  Plus,
  MoreHorizontal,
  Settings
} from 'lucide-react';
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
import { TableStatusColors, TableStatusLabels } from '@/types/venue';
import { OrganizationType } from '@/types/organization';
import { formatDate } from '@/lib/utils';
import { useUploadVenueImage } from '@/hooks/useImageUpload';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VenueDetails = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, currentOrganizationDetails } = useOrganization();
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
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const uploadVenueImage = useUploadVenueImage();

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  // Check if current organization is a food truck
  const isFoodTruck = currentOrganizationDetails?.type === OrganizationType.FOOD_TRUCK;

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

  const handleImageUpload = async () => {
    if (!selectedImageFile || !venueId) return;

    try {
      await uploadVenueImage.mutateAsync({
        file: selectedImageFile,
        data: {
          venueId,
          altText: 'Venue image',
        },
      });

      setSelectedImageFile(null);
      setIsImageDialogOpen(false);
      toast.success('Venue image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-optimized header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${organizationId}/venues`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="truncate">
                  <Link to={`/organizations/${organizationId}`} className="hover:text-foreground transition-colors">
                    {currentOrganization?.name}
                  </Link>
                </li>
                <li>•</li>
                <li className="truncate">
                  <Link to={`/organizations/${organizationId}/venues`} className="hover:text-foreground transition-colors">
                    Venues
                  </Link>
                </li>
                <li>•</li>
                <li className="text-foreground font-medium truncate">{currentVenue?.name || 'Venue'}</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Venue
                </DropdownMenuItem>
                {!isFoodTruck && (
                  <DropdownMenuItem onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables`)}>
                    <TableIcon className="h-4 w-4 mr-2" /> Manage Tables
                  </DropdownMenuItem>
                )}
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
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the venue
                    and all associated tables and QR codes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteVenue}
                    disabled={isDeleting}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Mobile-optimized venue header */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {isLoading ? <Skeleton className="h-8 sm:h-9 w-40" /> : currentVenue?.name}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {!isLoading && (
              <Badge variant={currentVenue?.isActive ? "default" : "secondary"} className="w-fit">
                {currentVenue?.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
            {currentVenue?.address && (
              <div className="flex items-center text-muted-foreground min-w-0">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="text-sm truncate">{currentVenue.address}</span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full mb-4 sm:mb-6 ${isFoodTruck ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            {!isFoodTruck && <TabsTrigger value="tables" className="text-xs sm:text-sm">Tables</TabsTrigger>}
            {!isFoodTruck && <TabsTrigger value="qrcodes" className="text-xs sm:text-sm">QR Codes</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Venue Information</CardTitle>
                  <CardDescription className="text-sm">Details about this venue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-3 sm:px-6">
                  {/* Professional Venue Image Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-muted-foreground">Venue Image</div>
                      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Edit className="h-3 w-3 mr-1" />
                            {currentVenue?.imageUrl ? 'Change' : 'Add'} Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Update Venue Image</DialogTitle>
                            <DialogDescription>
                              Upload a new image to showcase your venue
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <ImageUploadField
                              value={currentVenue?.imageUrl || ''}
                              onChange={() => {}} // We handle this through file selection
                              onFileSelect={setSelectedImageFile}
                              placeholder="Upload your venue image"
                              isUploading={uploadVenueImage.isPending}
                              maxSize={5 * 1024 * 1024} // 5MB limit
                            />
                            {selectedImageFile && (
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedImageFile(null);
                                    setIsImageDialogOpen(false);
                                  }}
                                  disabled={uploadVenueImage.isPending}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleImageUpload}
                                  disabled={uploadVenueImage.isPending}
                                >
                                  {uploadVenueImage.isPending ? 'Uploading...' : 'Upload Image'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {currentVenue?.imageUrl ? (
                      <div className="relative group w-full h-40 sm:h-48 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={currentVenue.imageUrl}
                          alt={currentVenue.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsImageDialogOpen(true)}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-40 sm:h-48 bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => setIsImageDialogOpen(true)}
                      >
                        <div className="text-center text-muted-foreground px-4">
                          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <div className="text-sm font-medium">No venue image</div>
                          <div className="text-xs mt-1 opacity-75">
                            Click to add an image to showcase your venue
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

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
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Statistics</CardTitle>
                  <CardDescription className="text-sm">Venue usage statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-3 sm:px-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : (
                    <>
                      {!isFoodTruck && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">Tables</div>
                          <div className="font-medium text-sm sm:text-base">{tables.length}</div>
                        </div>
                      )}
                      {!isFoodTruck && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">QR Codes</div>
                          <div className="font-medium text-sm sm:text-base">{isLoadingQrCodes ? '...' : qrCodes.length}</div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Total Scans</div>
                        <div className="font-medium text-sm sm:text-base">0</div>
                      </div>
                      {isFoodTruck && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">Mobile Location</div>
                          <div className="font-medium text-sm sm:text-base">Active</div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {!isFoodTruck && (
            <TabsContent value="tables">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Tables</CardTitle>
                    <CardDescription className="text-sm">Manage tables for this venue</CardDescription>
                  </div>
                  <Button
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/create`)}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Table
                  </Button>
                </CardHeader>
              <CardContent className="px-3 sm:px-6">
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
                  <>
                    {/* Desktop table view */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Capacity</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-sm">Location</th>
                            <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tables.map((table) => (
                            <tr key={table.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm">{table.name}</td>
                              <td className="py-3 px-4 text-sm">{table.capacity || '-'}</td>
                              <td className="py-3 px-4">
                                <Badge className={TableStatusColors[table.status]} variant="outline">
                                  {TableStatusLabels[table.status]}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm">{table.location || '-'}</td>
                              <td className="py-3 px-4 text-right">                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/${table.id}/edit`)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="sm:hidden space-y-3">
                      {tables.map((table) => (
                        <Card key={table.id} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-sm">{table.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={TableStatusColors[table.status]} variant="outline">
                                  {TableStatusLabels[table.status]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs text-muted-foreground mb-3">
                            <div className="flex justify-between">
                              <span>Capacity:</span>
                              <span>{table.capacity || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{table.location || '-'}</span>
                            </div>
                          </div>                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/tables/${table.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {!isFoodTruck && (
            <TabsContent value="qrcodes">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div></div>
              <Button
                onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}/qrcodes/create`)}
                className="w-full sm:w-auto"
                size="sm"
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
          )}
        </Tabs>
      </div>
  );
};

export default VenueDetails;
