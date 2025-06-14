import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVenue } from '@/contexts/venue-context';
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
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useOrganization } from '@/contexts/organization-context';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadVenueImage } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  imageUrl: z.string().url('Invalid URL').max(255, 'URL must be less than 255 characters').optional().or(z.literal('')).or(z.null()).transform(val => val || '')
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

const VenueCreate = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createVenue, isLoading } = useVenue();
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
      imageUrl: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: VenueFormValues) => {
    if (!organizationId || !data.name) return;

    setIsSubmitting(true);

    try {
      // Create venue first
      const venue = await createVenue({
        organizationId,
        name: data.name, // Ensure name is explicitly provided
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        imageUrl: imageUploadMethod === 'url' ? (data.imageUrl || undefined) : undefined
      });

      if (venue) {
        // Upload image if file was selected
        if (selectedImageFile && imageUploadMethod === 'upload') {
          try {
            await uploadVenueImage.mutateAsync({
              file: selectedImageFile,
              data: {
                venueId: venue.id,
                altText: `${data.name} venue image`,
              },
            });
          } catch (uploadError) {
            // Don't fail the entire process if image upload fails
          }
        }

        navigate(`/organizations/${organizationId}/venues`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}/venues`)}
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
                  <BreadcrumbLink>Create</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Create Venue</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a new venue to {currentOrganization?.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>
              Enter the details of your new venue
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

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${organizationId}/venues`)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Venue'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
  );
};

export default VenueCreate;
