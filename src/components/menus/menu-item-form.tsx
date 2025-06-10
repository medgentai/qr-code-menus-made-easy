import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useMenu } from '@/contexts/menu-context';
import { MenuItem, CreateMenuItemDto, UpdateMenuItemDto } from '@/services/menu-service';
import { Loader2, Leaf, Wheat } from 'lucide-react';
import { SpicyLevelLabels } from '@/types/menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommonAllergens } from '@/types/menu';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useUploadMenuItemImage } from '@/hooks/useImageUpload';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Item name must be at least 2 characters.',
  }).max(50, {
    message: 'Item name must not exceed 50 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must not exceed 500 characters.',
  }).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Price must be a valid decimal number with up to 2 decimal places.',
  }),
  discountPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Discount price must be a valid decimal number with up to 2 decimal places.',
  }).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  preparationTime: z.coerce.number().int().min(0).optional(),
  calories: z.coerce.number().int().min(0).optional(),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spicyLevel: z.coerce.number().int().min(0).max(5).default(0),
  allergens: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

interface MenuItemFormProps {
  categoryId: string;
  menuItem?: MenuItem;
  onSuccess: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ categoryId, menuItem, onSuccess }) => {
  const { createMenuItem, updateMenuItem, isLoading } = useMenu();
  const uploadMenuItemImage = useUploadMenuItemImage();
  const isEditing = !!menuItem;
  const [selectedAllergens, setSelectedAllergens] = React.useState<string[]>(
    menuItem?.allergens ? menuItem.allergens.split(',').map(a => a.trim()) : []
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: menuItem?.name || '',
      description: menuItem?.description || '',
      price: menuItem?.price.toString() || '',
      discountPrice: menuItem?.discountPrice?.toString() || '',
      imageUrl: menuItem?.imageUrl || '',
      preparationTime: menuItem?.preparationTime || undefined,
      calories: menuItem?.calories || undefined,
      isVegetarian: menuItem?.isVegetarian || false,
      isVegan: menuItem?.isVegan || false,
      isGlutenFree: menuItem?.isGlutenFree || false,
      spicyLevel: menuItem?.spicyLevel || 0,
      allergens: menuItem?.allergens || '',
      displayOrder: menuItem?.displayOrder || 0,
      isAvailable: menuItem?.isAvailable ?? true,
    },
  });

  // Handle allergen selection
  const handleAllergenChange = (allergen: string) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergen)) {
        return prev.filter(a => a !== allergen);
      } else {
        return [...prev, allergen];
      }
    });
  };

  // Update form value when allergens change
  React.useEffect(() => {
    form.setValue('allergens', selectedAllergens.join(', '));
  }, [selectedAllergens, form]);

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('🚀 Menu item form submission started:', {
      isEditing,
      hasSelectedFile: !!selectedFile,
      menuItemId: menuItem?.id,
      selectedFileName: selectedFile?.name,
    });

    try {
      let imageUrl = values.imageUrl;

      // Upload image if a new file was selected (only for editing)
      if (selectedFile && isEditing && menuItem) {
        const uploadResult = await uploadMenuItemImage.mutateAsync({
          file: selectedFile,
          data: {
            menuItemId: menuItem.id,
          },
        });

        imageUrl = uploadResult.url;
      }

      if (isEditing && menuItem) {
        const menuItemData: UpdateMenuItemDto = {
          name: values.name,
          price: values.price,
          description: values.description,
          imageUrl: imageUrl || undefined,
          discountPrice: values.discountPrice || undefined,
          preparationTime: values.preparationTime,
          calories: values.calories,
          isVegetarian: values.isVegetarian,
          isVegan: values.isVegan,
          isGlutenFree: values.isGlutenFree,
          spicyLevel: values.spicyLevel,
          allergens: values.allergens,
          displayOrder: values.displayOrder,
          isAvailable: values.isAvailable,
        };

        const updatedMenuItem = await updateMenuItem(menuItem.id, menuItemData);
        if (updatedMenuItem) {
          onSuccess();
        }
      } else {
        // First create the menu item without image
        const menuItemData: CreateMenuItemDto = {
          name: values.name,
          price: values.price,
          description: values.description,
          imageUrl: undefined, // Will be updated after image upload
          discountPrice: values.discountPrice || undefined,
          preparationTime: values.preparationTime,
          calories: values.calories,
          isVegetarian: values.isVegetarian,
          isVegan: values.isVegan,
          isGlutenFree: values.isGlutenFree,
          spicyLevel: values.spicyLevel,
          allergens: values.allergens,
          displayOrder: values.displayOrder,
          isAvailable: values.isAvailable,
        };

        const newMenuItem = await createMenuItem(categoryId, menuItemData);

        if (newMenuItem) {
          // Upload image if file was selected
          if (selectedFile) {
            await uploadMenuItemImage.mutateAsync({
              file: selectedFile,
              data: {
                menuItemId: newMenuItem.id,
              },
            });
          }
          onSuccess();
        }
      }
    } catch (error) {
      // Error handling is done by the mutation hooks
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
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Margherita Pizza" {...field} />
              </FormControl>
              <FormDescription>
                The name of the item as it will appear on the menu.
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
                  placeholder="Describe this item..."
                  className="resize-none min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of the menu item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <Input className="pl-7" placeholder="9.99" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  The regular price of the item.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <Input className="pl-7" placeholder="7.99" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  The discounted price, if applicable.
                </FormDescription>
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
              <FormLabel>Menu Item Image (Optional)</FormLabel>
              <FormControl>
                <ImageUploadField
                  value={field.value}
                  onChange={field.onChange}
                  onFileSelect={setSelectedFile}
                  placeholder="Upload an image of this menu item"
                  isUploading={uploadMenuItemImage.isPending}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Upload an image to showcase this menu item. Supports JPEG, PNG, and WebP formats.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="preparationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Estimated time to prepare this item.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Calorie count for this item.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-green-600" />
              <Label className="text-base font-semibold">Dietary Information</Label>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select the dietary categories that apply to this item. This helps customers filter menu items based on their preferences.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                💡 <strong>Note:</strong> If none of these are selected, the item will be considered non-vegetarian and will appear when customers filter for "Non-Vegetarian" items.
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="isVegetarian"
                render={({ field }) => (
                  <FormItem className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                    field.value ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-green-100'
                  }`}>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2 cursor-pointer">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Vegetarian
                      </FormLabel>
                      <p className="text-xs text-gray-500">Contains no meat or fish</p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVegan"
                render={({ field }) => (
                  <FormItem className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                    field.value ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-green-100'
                  }`}>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2 cursor-pointer">
                        <Leaf className="h-4 w-4 text-green-700" />
                        Vegan
                      </FormLabel>
                      <p className="text-xs text-gray-500">No animal products</p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isGlutenFree"
                render={({ field }) => (
                  <FormItem className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                    field.value ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-100'
                  }`}>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2 cursor-pointer">
                        <Wheat className="h-4 w-4 text-amber-600" />
                        Gluten Free
                      </FormLabel>
                      <p className="text-xs text-gray-500">Contains no gluten</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="spicyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spicy Level: {SpicyLevelLabels[field.value]}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormDescription>
                  The spiciness level of this item (0 = Not Spicy, 5 = Extreme).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Common Allergens</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CommonAllergens.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={selectedAllergens.includes(allergen)}
                    onCheckedChange={() => handleAllergenChange(allergen)}
                  />
                  <label
                    htmlFor={`allergen-${allergen}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {allergen}
                  </label>
                </div>
              ))}
            </div>
            <FormField
              control={form.control}
              name="allergens"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                The order in which this item appears in its category (lower numbers appear first).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Availability</FormLabel>
                <FormDescription>
                  Is this item currently available for ordering?
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
            {isEditing ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
