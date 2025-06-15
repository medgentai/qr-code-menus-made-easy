import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVenue } from '@/contexts/venue-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useOrganization } from '@/contexts/organization-context';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadVenueImage } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Form schema
const venueFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional(),
  phoneNumber: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  email: z.string().email('Invalid email address').max(100, 'Email must be less than 100 characters').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').max(255, 'URL must be less than 255 characters').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  viewOnlyMode: z.boolean().default(false)
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

const VenueEdit = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId: string }>();
  const navigate = useNavigate();
  const { currentVenue, fetchVenueById, updateVenue, isLoading } = useVenue();
  const { currentOrganization, fetchOrganizationDetails } = useOrganization();
  const uploadVenueImage = useUploadVenueImage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'upload'>('url');

  // Initialize form
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phoneNumber: '',
      email: '',
      imageUrl: '',
      isActive: true,
      viewOnlyMode: false
    }
  });

  // Fetch venue data
  useEffect(() => {
    // Note: Organization details are automatically fetched by the organization context
    if (venueId) {
      fetchVenueById(venueId).then(venue => {
        if (venue) {
          // Reset form with venue data
          form.reset({
            name: venue.name,
            description: venue.description || '',
            address: venue.address || '',
            city: venue.city || '',
            state: venue.state || '',
            country: venue.country || '',
            postalCode: venue.postalCode || '',
            phoneNumber: venue.phoneNumber || '',
            email: venue.email || '',
            imageUrl: venue.imageUrl || '',
            isActive: venue.isActive,
            viewOnlyMode: venue.viewOnlyMode || false
          });
        }
      });
    }
  }, [venueId, fetchVenueById, form]);

  // Handle form submission
  const onSubmit = async (data: VenueFormValues) => {
    if (!venueId) return;

    setIsSubmitting(true);

    try {
      // Upload image if file was selected
      if (selectedImageFile && imageUploadMethod === 'upload') {
        try {
          await uploadVenueImage.mutateAsync({
            file: selectedImageFile,
            data: {
              venueId: venueId,
              altText: `${data.name} venue image`,
            },
          });
        } catch (uploadError) {
          // Continue with venue update even if image upload fails
        }
      }

      const venue = await updateVenue(venueId, {
        ...data,
        // Only update imageUrl if using URL method, otherwise keep existing
        ...(imageUploadMethod === 'url' && {
          imageUrl: data.imageUrl || undefined
        })
      });

      if (venue) {
        navigate(`/organizations/${organizationId}/venues/${venueId}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !currentVenue) {
    return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
            className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/organizations">Organizations</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}`}>
                      {currentOrganization?.name || 'Organization'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}/venues`}>Venues</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/organizations/${organizationId}/venues/${venueId}`}>
                      {currentVenue?.name || 'Venue'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Edit</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Edit Venue</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Update venue information for {currentVenue?.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>
              Update the details of your venue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Downtown Restaurant" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your venue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="venue@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Contact email for this venue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of your venue"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about your venue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Image (Optional)</FormLabel>
                      <FormControl>
                        <Tabs value={imageUploadMethod} onValueChange={(value) => setImageUploadMethod(value as 'url' | 'upload')}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="url">URL</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                          </TabsList>
                          <TabsContent value="url" className="space-y-2">
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter a URL to your venue image
                            </p>
                          </TabsContent>
                          <TabsContent value="upload" className="space-y-2">
                            <ImageUploadField
                              value={field.value}
                              onChange={field.onChange}
                              onFileSelect={setSelectedImageFile}
                              placeholder="Upload your venue image"
                              maxSize={5 * 1024 * 1024} // 5MB limit
                              disabled={isSubmitting}
                            />
                          </TabsContent>
                        </Tabs>
                      </FormControl>
                      <FormDescription>
                        Add an image for your venue using a URL or by uploading a file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Set whether this venue is active and visible to customers
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
                          When enabled, customers can view menus and track orders but cannot place new orders. This overrides the organization setting.
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

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${organizationId}/venues/${venueId}`)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
  );
};

export default VenueEdit;
