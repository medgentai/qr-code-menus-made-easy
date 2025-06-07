import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@/contexts/organization-context';
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
import { ArrowLeft, Building2 } from 'lucide-react';
import { OrganizationType, OrganizationTypeLabels } from '@/types/organization';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadOrganizationLogo } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form validation schema
const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  slug: z.string()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(100, { message: 'Slug must be at most 100 characters' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional(),
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
});

type FormValues = z.infer<typeof createOrganizationSchema>;

const OrganizationCreate = () => {
  const { createOrganization, organizations } = useOrganization();
  const navigate = useNavigate();
  const uploadLogo = useUploadOrganizationLogo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoUploadMethod, setLogoUploadMethod] = useState<'url' | 'upload'>('url');

  // Check if user has existing organizations
  const hasExistingOrganizations = organizations.length > 0;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      type: OrganizationType.RESTAURANT,
    },
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle name change to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Only auto-generate slug if it's empty or hasn't been manually edited
    if (!form.getValues('slug')) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let logoUrl = data.logoUrl;

      // Create organization first
      const newOrg = await createOrganization({
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
        logoUrl: logoUrl || undefined,
        websiteUrl: data.websiteUrl || undefined,
        type: data.type,
      });

      if (newOrg) {
        // Upload logo if file was selected
        if (selectedLogoFile && logoUploadMethod === 'upload') {
          try {
            const uploadResult = await uploadLogo.mutateAsync({
              file: selectedLogoFile,
              organizationId: newOrg.id,
              data: {
                altText: `${data.name} logo`,
              },
            });
            // Logo URL will be automatically updated in the organization via the upload service
          } catch (uploadError) {
            console.error('Logo upload failed:', uploadError);
            // Continue with organization creation even if logo upload fails
          }
        }

        // Add a small delay to allow context state to update before navigation
        setTimeout(() => {
          navigate(`/organizations/${newOrg.id}`);
        }, 100);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
          {hasExistingOrganizations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/organizations')}
              className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Create Organization</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {hasExistingOrganizations
                ? "Set up a new organization to manage your venues and menus"
                : "Set up your organization with subscription and first venue"
              }
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Enter the details for your new organization
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
                            />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for your organization in URLs (auto-generated if left empty)
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            <FormLabel>Organization Logo (Optional)</FormLabel>
                            <FormControl>
                              <Tabs value={logoUploadMethod} onValueChange={(value) => setLogoUploadMethod(value as 'url' | 'upload')}>
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="url">URL</TabsTrigger>
                                  <TabsTrigger value="upload">Upload</TabsTrigger>
                                </TabsList>
                                <TabsContent value="url" className="space-y-2">
                                  <Input
                                    placeholder="https://example.com/logo.png"
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter a URL to your organization's logo
                                  </p>
                                </TabsContent>
                                <TabsContent value="upload" className="space-y-2">
                                  <ImageUploadField
                                    value={field.value}
                                    onChange={field.onChange}
                                    onFileSelect={setSelectedLogoFile}
                                    placeholder="Upload your organization logo"
                                    maxSize={5 * 1024 * 1024} // 5MB limit for logos
                                    disabled={isSubmitting}
                                  />
                                </TabsContent>
                              </Tabs>
                            </FormControl>
                            <FormDescription>
                              Add a logo for your organization using a URL or by uploading a file
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      {hasExistingOrganizations && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/organizations')}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Organization'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>About Organizations</CardTitle>
                <CardDescription>
                  What you need to know about organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Organization Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      Organizations contain venues, menus, and team members
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Organizations</strong> are the top-level entities in ScanServe.
                  </p>
                  <p className="text-sm">
                    Each organization can have multiple venues, menus, and team members.
                  </p>
                  <p className="text-sm">
                    As the creator, you'll be the owner with full control over the organization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default OrganizationCreate;
