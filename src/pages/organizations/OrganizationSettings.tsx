import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { OrganizationType, OrganizationTypeLabels } from '@/types/organization';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadOrganizationLogo } from '@/hooks/useImageUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { TaxConfigurationList } from '@/components/tax/TaxConfigurationList';

// Form validation schema
const updateOrganizationSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  slug: z.string()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(100, { message: 'Slug must be at most 100 characters' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    }),
  description: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional()
    .or(z.literal('')),
  logoUrl: z.string()
    .url({ message: 'Logo URL must be a valid URL' })
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .transform(val => val || ''),
  websiteUrl: z.string()
    .url({ message: 'Website URL must be a valid URL' })
    .optional()
    .or(z.literal('')),
  type: z.nativeEnum(OrganizationType, {
    errorMap: () => ({ message: 'Please select a valid organization type' }),
  }),
  isActive: z.boolean(),
  viewOnlyMode: z.boolean(),
});

type FormValues = z.infer<typeof updateOrganizationSchema>;

const OrganizationSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { user } = authState;
  const {
    currentOrganization,
    currentOrganizationDetails,
    fetchOrganizationDetails,
    updateOrganization,
    deleteOrganization,
    isLoading
  } = useOrganization();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const uploadLogo = useUploadOrganizationLogo();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      type: OrganizationType.RESTAURANT,
      isActive: true,
      viewOnlyMode: false,
    },
  });

  // Note: Organization details are automatically fetched by the organization context
  // when the current organization changes, so we don't need to fetch them here

  // Update form values when organization data is loaded
  useEffect(() => {
    if (currentOrganization) {
      form.reset({
        name: currentOrganization.name,
        slug: currentOrganization.slug,
        description: currentOrganization.description || '',
        logoUrl: currentOrganization.logoUrl || '',
        websiteUrl: currentOrganization.websiteUrl || '',
        type: currentOrganization.type,
        isActive: currentOrganization.isActive,
        viewOnlyMode: currentOrganization.viewOnlyMode || false,
      });
    }
  }, [currentOrganization, form]);

  // Check if current user is the owner
  useEffect(() => {
    const checkOwnership = () => {
      // Try to get user from auth context first, then fallback to localStorage
      let currentUser = user;

      // If auth context user is missing, try to get from localStorage
      if (!currentUser) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
          }
        } catch (error) {
          // Silently handle localStorage parsing errors
        }
      }

      if (!currentOrganizationDetails || !currentUser || !currentOrganizationDetails.owner) {
        setIsOwner(false);
        return;
      }

      // Convert both IDs to strings for comparison (handles string vs number issues)
      const userId = String(currentUser.id);
      const ownerId = String(currentOrganizationDetails.owner.id);
      const isUserOwner = userId === ownerId;

      setIsOwner(isUserOwner);
    };

    checkOwnership();
  }, [currentOrganizationDetails, user]);

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !id) return;

    try {
      await uploadLogo.mutateAsync({
        file: selectedLogoFile,
        organizationId: id,
        data: { altText: 'Organization logo' },
      });

      setSelectedLogoFile(null);
      setIsLogoDialogOpen(false);
      toast.success('Organization logo updated successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        logoUrl: data.logoUrl || undefined,
        websiteUrl: data.websiteUrl || undefined,
        type: data.type,
        isActive: data.isActive,
        viewOnlyMode: data.viewOnlyMode,
      };

      await updateOrganization(id, updateData);
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle organization deletion
  const handleDeleteOrganization = async () => {
    if (!id) return;

    const success = await deleteOrganization(id);
    if (success) {
      navigate('/organizations');
    }
  };

  // Check if delete button should be enabled
  const isDeleteEnabled = deleteConfirmText === currentOrganization?.name;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${id}`}>{currentOrganization?.name}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Settings</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Avatar className="h-12 w-12 flex-shrink-0">
              {currentOrganization?.logoUrl ? (
                <AvatarImage src={currentOrganization.logoUrl} alt={currentOrganization.name} />
              ) : (
                <AvatarFallback>
                  {currentOrganization?.name ? getInitials(currentOrganization.name) : 'ORG'}
                </AvatarFallback>
              )}
            </Avatar>
            <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Organization Logo</DialogTitle>
                  <DialogDescription>
                    Upload a new logo for your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <ImageUploadField
                    value={currentOrganization?.logoUrl || ''}
                    onChange={() => {}} // We handle this through file selection
                    onFileSelect={setSelectedLogoFile}
                    placeholder="Upload your organization logo"
                    isUploading={uploadLogo.isPending}
                    maxSize={5 * 1024 * 1024} // 5MB limit
                  />
                  {selectedLogoFile && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedLogoFile(null);
                          setIsLogoDialogOpen(false);
                        }}
                        disabled={uploadLogo.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleLogoUpload}
                        disabled={uploadLogo.isPending}
                      >
                        {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage settings for {currentOrganization?.name}
            </p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-auto">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-full md:w-auto md:min-w-0">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tax">Tax Configuration</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Tasty Bites Restaurant"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The name of your organization as it will appear to users
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. tasty-bites"
                              {...field}
                              disabled={!isOwner}
                            />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for your organization in URLs
                            {!isOwner && " (Only the owner can change this)"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!isOwner}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select organization type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(OrganizationTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of business your organization represents
                            {!isOwner && " (Only the owner can change this)"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your organization..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description of your organization (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="websiteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your organization's website (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Organization Logo (Optional)</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsLogoDialogOpen(true)}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {currentOrganization?.logoUrl ? 'Change' : 'Add'} Logo
                              </Button>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/logo.png"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a URL to your organization's logo, or use the button above to upload a file
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <FormDescription>
                              When inactive, the organization will not be accessible to customers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="viewOnlyMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-orange-200 bg-orange-50/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">View-Only Mode</FormLabel>
                            <FormDescription>
                              When enabled, customers can view menus and track orders but cannot place new orders. This affects all venues in this organization.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col sm:flex-col md:flex-row md:justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/organizations/${id}`)}
                        className="w-full sm:w-full md:w-auto order-2 md:order-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-full md:w-auto order-1 md:order-2"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>
                  Manage tax rates and settings for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentOrganization && (
                  <TaxConfigurationList
                    organizationId={currentOrganization.id}
                    organizationType={currentOrganization.type}
                    canManage={isOwner || ['ADMINISTRATOR', 'MANAGER'].includes(user?.role || '')}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive/50">
              <CardHeader className="text-destructive">
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-destructive/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Delete Organization</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this organization and all its data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={!isOwner}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Organization
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>
                              This action cannot be undone. It will permanently delete the organization
                              <strong> {currentOrganization?.name}</strong> and all associated data.
                            </p>
                            <div className="rounded-md bg-muted p-3 text-sm">
                              <p className="font-medium">This will delete:</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>All organization settings and information</li>
                                <li>All venues associated with this organization</li>
                                <li>All menus and menu items</li>
                                <li>All QR codes and their tracking data</li>
                                <li>All member associations</li>
                              </ul>
                            </div>
                            <div className="pt-2">
                              <p className="font-medium mb-2">
                                Type <strong>{currentOrganization?.name}</strong> to confirm:
                              </p>
                              <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder={`Type "${currentOrganization?.name}" to confirm`}
                                className="border-destructive/50"
                              />
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteOrganization}
                            disabled={!isDeleteEnabled}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Organization
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {!isOwner && (
                    <p className="text-xs text-destructive mt-2">
                      Only the organization owner can delete this organization.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OrganizationSettings;
