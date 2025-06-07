import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMenu } from '@/contexts/menu-context';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/services/menu-service';
import { Loader2 } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadCategoryImage } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }).max(50, {
    message: 'Category name must not exceed 50 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must not exceed 500 characters.',
  }).optional(),
  imageUrl: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty values
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Please enter a valid URL or leave empty.' }),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

interface CategoryFormProps {
  menuId: string;
  category?: Category;
  onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ menuId, category, onSuccess }) => {
  const { createCategory, updateCategory, isLoading } = useMenu();
  const uploadCategoryImage = useUploadCategoryImage();
  const isEditing = !!category;
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [imageUploadMethod, setImageUploadMethod] = React.useState<'url' | 'upload'>('url');

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      imageUrl: category?.imageUrl || '',
      displayOrder: category?.displayOrder || 0,
      isActive: category?.isActive ?? true,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let imageUrl = values.imageUrl;

    if (isEditing && category) {
      // Upload image if file was selected
      if (selectedImageFile && imageUploadMethod === 'upload') {
        try {
          const uploadResult = await uploadCategoryImage.mutateAsync({
            file: selectedImageFile,
            data: {
              categoryId: category.id,
              altText: `${values.name} category image`,
            },
          });
          // Update the imageUrl with the uploaded image URL
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          // Continue with category update even if image upload fails
        }
      }

      const categoryData: UpdateCategoryDto = {
        ...values,
        imageUrl: imageUploadMethod === 'url' ? (values.imageUrl || undefined) : imageUrl,
      };

      const updatedCategory = await updateCategory(category.id, categoryData);
      if (updatedCategory) {
        onSuccess();
      }
    } else {
      const categoryData: CreateCategoryDto = {
        name: values.name, // Explicitly set the required name property
        description: values.description,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
        imageUrl: imageUploadMethod === 'url' ? (values.imageUrl || undefined) : undefined,
      };

      const newCategory = await createCategory(menuId, categoryData);
      if (newCategory) {
        // Upload image if file was selected
        if (selectedImageFile && imageUploadMethod === 'upload') {
          try {
            const uploadResult = await uploadCategoryImage.mutateAsync({
              file: selectedImageFile,
              data: {
                categoryId: newCategory.id,
                altText: `${values.name} category image`,
              },
            });
            console.log('Category image uploaded successfully:', uploadResult);

            // Update the category with the uploaded image URL
            await updateCategory(newCategory.id, { imageUrl: uploadResult.url });
          } catch (uploadError) {
            console.error('Category image upload failed:', uploadError);
            // Don't fail the entire process if image upload fails
          }
        }
        onSuccess();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Appetizers" {...field} />
              </FormControl>
              <FormDescription>
                The name of the category as it will appear on the menu.
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this category..."
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of the category.
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
              <FormLabel>Category Image (Optional)</FormLabel>
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
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to your category image
                    </p>
                  </TabsContent>
                  <TabsContent value="upload" className="space-y-2">
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                      onFileSelect={setSelectedImageFile}
                      placeholder="Upload your category image"
                      maxSize={5 * 1024 * 1024} // 5MB limit
                      disabled={isLoading}
                    />
                  </TabsContent>
                </Tabs>
              </FormControl>
              <FormDescription>
                Add an image for your category using a URL or by uploading a file
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormDescription>
                The order in which this category appears on the menu (lower numbers appear first).
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
                  Make this category visible on the menu.
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
