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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { OrganizationType, OrganizationTypeLabels } from '@/types/organization';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const organizationDetailsSchema = z.object({
  name: z.string()
    .min(1, { message: 'Organization name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  slug: z.string()
    .min(1, { message: 'URL slug is required' })
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(100, { message: 'Slug must be at most 100 characters' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    }),
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
    errorMap: () => ({ message: 'Please select an organization type' }),
  }),
});

type FormValues = z.infer<typeof organizationDetailsSchema>;

interface OrganizationDetailsStepProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues & { logoFile?: File; logoUploadMethod?: 'url' | 'upload' }) => void;
  onBack?: () => void;
}

const OrganizationDetailsStep: React.FC<OrganizationDetailsStepProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const [selectedLogoFile, setSelectedLogoFile] = React.useState<File | null>(null);
  const [logoUploadMethod, setLogoUploadMethod] = React.useState<'url' | 'upload'>('url');

  const form = useForm<FormValues>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      logoUrl: initialData?.logoUrl || '',
      websiteUrl: initialData?.websiteUrl || '',
      type: initialData?.type || undefined,
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

    // Auto-generate slug from name (always update since slug is required)
    const slug = generateSlug(name);
    form.setValue('slug', slug, { shouldValidate: true });
  };

  // Handle form submission with file data
  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      logoFile: selectedLogoFile || undefined,
      logoUploadMethod,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Tasty Bites Restaurant"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e); // Update the form field
                    handleNameChange(e); // Generate slug
                  }}
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
              <FormLabel>URL Slug *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. tasty-bites"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A unique identifier for your organization in URLs (auto-generated from name)
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
              <FormLabel>Organization Type *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button type="submit" className={!onBack ? 'ml-auto' : ''}>
            Continue to Plan Selection
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrganizationDetailsStep;
