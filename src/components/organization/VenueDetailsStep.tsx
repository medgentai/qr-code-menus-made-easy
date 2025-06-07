import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, Phone, Mail, Globe } from 'lucide-react';
import { OrganizationType } from '@/types/organization';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadVenueImage } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const venueDetailsSchema = z.object({
  venueName: z.string()
    .min(1, { message: 'Venue name is required' })
    .min(2, { message: 'Venue name must be at least 2 characters' })
    .max(100, { message: 'Venue name must be at most 100 characters' }),
  venueDescription: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional(),
  address: z.string()
    .max(200, { message: 'Address must be less than 200 characters' })
    .optional(),
  city: z.string()
    .max(100, { message: 'City must be less than 100 characters' })
    .optional(),
  state: z.string()
    .max(100, { message: 'State must be less than 100 characters' })
    .optional(),
  country: z.string()
    .max(100, { message: 'Country must be less than 100 characters' })
    .optional(),
  postalCode: z.string()
    .max(20, { message: 'Postal code must be less than 20 characters' })
    .optional(),
  phoneNumber: z.string()
    .max(20, { message: 'Phone number must be less than 20 characters' })
    .optional(),
  email: z.string()
    .email({ message: 'Invalid email address' })
    .max(100, { message: 'Email must be less than 100 characters' })
    .optional(),
  imageUrl: z.string()
    .url({ message: 'Invalid URL format' })
    .max(255, { message: 'URL must be less than 255 characters' })
    .optional()
    .or(z.literal(''))
});

type FormValues = z.infer<typeof venueDetailsSchema>;

interface VenueDetailsStepProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues & { imageFile?: File; imageUploadMethod?: 'url' | 'upload' }) => void;
  onBack: () => void;
  organizationType?: OrganizationType;
}

// Function to get venue pricing based on organization type
const getVenuePricing = (organizationType?: OrganizationType) => {
  switch (organizationType) {
    case OrganizationType.HOTEL:
      return {
        monthly: 1699, // ₹1699 per month for hotels
        yearly: 1499,  // ₹1499 per month if billed yearly for hotels
      };
    case OrganizationType.RESTAURANT:
    default:
      return {
        monthly: 799,  // ₹799 per month for restaurants
        yearly: 599,   // ₹599 per month if billed yearly for restaurants
      };
  }
};

const VenueDetailsStep: React.FC<VenueDetailsStepProps> = ({
  initialData,
  onSubmit,
  onBack,
  organizationType,
}) => {
  const venuePricing = getVenuePricing(organizationType);
  const uploadVenueImage = useUploadVenueImage();
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [imageUploadMethod, setImageUploadMethod] = React.useState<'url' | 'upload'>('url');
  const form = useForm<FormValues>({
    resolver: zodResolver(venueDetailsSchema),
    defaultValues: {
      venueName: initialData?.venueName || '',
      venueDescription: initialData?.venueDescription || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      postalCode: initialData?.postalCode || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      imageUrl: initialData?.imageUrl || ''
    },
  });

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Your First Venue</CardTitle>
              <CardDescription className="text-blue-700">
                Set up your first venue to get started with ScanServe
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Your subscription includes one venue</p>
            <p>• You can add more venues later:</p>
            <div className="ml-4 space-y-1">
              <p>- Monthly billing: ₹{venuePricing.monthly}/month per venue</p>
              <p>- Yearly billing: ₹{venuePricing.yearly}/month per venue (billed annually)</p>
            </div>
            <p>• Each venue can have multiple tables and QR codes</p>
            <p>• You can create different menus for each venue</p>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => onSubmit({
          ...values,
          imageFile: selectedImageFile || undefined,
          imageUploadMethod
        }))} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="venueName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. Main Restaurant, Downtown Branch, Hotel Lobby"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The name of your venue as it will appear to customers
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="venue@example.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Contact email for this venue (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your venue, its atmosphere, specialties, or any other details customers should know..."
                      className="resize-none min-h-[100px]"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your venue (optional but recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Contact phone number for this venue (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="https://example.com/image.jpg"
                              className="pl-10"
                              {...field}
                            />
                          </div>
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
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </h4>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormDescription>
                    Physical address of your venue (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>

          {/* Additional Info */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Complete Payment</p>
                    <p className="text-muted-foreground">Secure payment processing with Razorpay</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Organization & Venue Created</p>
                    <p className="text-muted-foreground">Your organization and first venue will be set up</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start Building</p>
                    <p className="text-muted-foreground">Create menus, add tables, and generate QR codes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue to Payment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VenueDetailsStep;
