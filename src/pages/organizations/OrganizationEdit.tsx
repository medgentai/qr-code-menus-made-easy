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
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building2 } from 'lucide-react';
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
import { UpdateOrganizationDto } from '@/services/organization-service';
import { Skeleton } from '@/components/ui/skeleton';

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
    .optional(),
  logoUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  websiteUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof updateOrganizationSchema>;

// Helper function to get initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const OrganizationEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { user } = authState;
  const {
    currentOrganization,
    currentOrganizationDetails,
    fetchOrganizationDetails,
    updateOrganization,
    isLoading
  } = useOrganization();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoUploadMethod, setLogoUploadMethod] = useState<'url' | 'upload'>('url');
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
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
      isActive: true,
    },
  });

  // Load organization data
  useEffect(() => {
    if (id && (!currentOrganization || currentOrganization.id !== id)) {
      fetchOrganizationDetails(id);
    }
  }, [id, currentOrganization, fetchOrganizationDetails]);

  // Update form values when organization data is loaded
  useEffect(() => {
    if (currentOrganization && currentOrganization.id === id) {
      form.reset({
        name: currentOrganization.name,
        slug: currentOrganization.slug,
        description: currentOrganization.description || '',
        logoUrl: currentOrganization.logoUrl || '',
        websiteUrl: currentOrganization.websiteUrl || '',
        isActive: currentOrganization.isActive,
      });
    }
  }, [currentOrganization, id, form]);

  // Handle name change to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    // Auto-generate slug from name if slug is empty or matches the previous auto-generated slug
    const currentSlug = form.getValues('slug');
    const autoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!currentSlug || currentSlug === autoSlug) {
      form.setValue('slug', autoSlug);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !id) return;

    try {
      const result = await uploadLogo.mutateAsync({
        file: selectedLogoFile,
        organizationId: id,
        data: { altText: 'Organization logo' },
      });
      
      form.setValue('logoUrl', result.url);
      setSelectedLogoFile(null);
      setLogoDialogOpen(false);
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Upload logo first if there's a selected file
      if (selectedLogoFile) {
        await handleLogoUpload();
      }

      const updateData: UpdateOrganizationDto = {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        logoUrl: values.logoUrl || undefined,
        websiteUrl: values.websiteUrl || undefined,
        isActive: values.isActive,
      };

      const updatedOrg = await updateOrganization(id, updateData);
      if (updatedOrg) {
        navigate(`/organizations/${id}`);
      }
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !currentOrganization || currentOrganization.id !== id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-8 w-48" />
        <Separator />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-optimized header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/organizations/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="truncate">
                  <Link to={`/organizations/${id}`} className="hover:text-foreground transition-colors">
                    {currentOrganization.name}
                  </Link>
                </li>
                <li>•</li>
                <li className="text-foreground font-medium">Edit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile-optimized organization header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            {currentOrganization.logoUrl ? (
              <AvatarImage src={currentOrganization.logoUrl} alt={currentOrganization.name} />
            ) : (
              <AvatarFallback>
                {getInitials(currentOrganization.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              Edit Organization
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
              Update settings for {currentOrganization.name}
            </p>
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Organization Information</CardTitle>
            <CardDescription className="text-sm">
              Update your organization's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Organization Name */}
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
                          onChange={handleNameChange}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your organization as it will appear to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. tasty-bites-restaurant"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier for your organization (lowercase letters, numbers, and hyphens only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your organization..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your organization (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization Type - Read Only */}
                <div className="space-y-2">
                  <FormLabel>Organization Type</FormLabel>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    {currentOrganization && (
                      <>
                        <span className="text-sm font-medium">
                          {OrganizationTypeLabels[currentOrganization.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (Cannot be changed after creation)
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Organization type cannot be changed as it was set during the initial setup and payment
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <FormLabel>Organization Logo (Optional)</FormLabel>
                  <div className="flex items-center gap-4">
                    {/* Logo Preview */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16 border-2 border-border">
                        {form.watch('logoUrl') ? (
                          <AvatarImage src={form.watch('logoUrl')} alt="Organization logo" />
                        ) : (
                          <AvatarFallback className="text-lg">
                            {currentOrganization ? getInitials(currentOrganization.name) : 'ORG'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Change Logo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Update Organization Logo</DialogTitle>
                              <DialogDescription>
                                Upload a new logo or provide a URL to an existing image.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={logoUploadMethod === 'url' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setLogoUploadMethod('url')}
                                >
                                  URL
                                </Button>
                                <Button
                                  type="button"
                                  variant={logoUploadMethod === 'upload' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setLogoUploadMethod('upload')}
                                >
                                  Upload
                                </Button>
                              </div>

                              {logoUploadMethod === 'url' ? (
                                <FormField
                                  control={form.control}
                                  name="logoUrl"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="https://example.com/logo.jpg"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter a URL to your organization's logo image
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ) : (
                                <div className="space-y-4">
                                  <ImageUploadField
                                    value={form.watch('logoUrl')}
                                    onChange={(url) => form.setValue('logoUrl', url || '')}
                                    onFileSelect={setSelectedLogoFile}
                                    placeholder="Upload your organization logo"
                                    isUploading={uploadLogo.isPending}
                                    maxSize={5 * 1024 * 1024} // 5MB limit
                                    aspectRatio="square"
                                    className="max-w-xs mx-auto"
                                  />
                                  {selectedLogoFile && (
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedLogoFile(null);
                                          form.setValue('logoUrl', currentOrganization?.logoUrl || '');
                                        }}
                                        disabled={uploadLogo.isPending}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={handleLogoUpload}
                                        disabled={uploadLogo.isPending}
                                      >
                                        {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {form.watch('logoUrl') && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue('logoUrl', '')}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website URL */}
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourwebsite.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your organization's website URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          When inactive, your organization will be hidden from public view
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

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${id}`)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || uploadLogo.isPending}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Organization'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OrganizationEdit;
