import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { qrCodeService, CreateQrCodeData } from '@/services/qrCodeService';
import { useNavigate } from 'react-router-dom';

// Define form schema with Zod
const formSchema = z.object({
  venueId: z.string().uuid({ message: 'Please select a venue' }),
  menuId: z.string().uuid({ message: 'Please select a menu' }),
  tableId: z.union([
    z.string().uuid({ message: 'Please select a valid table' }),
    z.literal('none')
  ]).optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface Menu {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
}

interface CreateQrCodeFormProps {
  venueId: string;
  menus: Menu[];
  tables: Table[];
  onSuccess?: (qrCodeId: string) => void;
}

const CreateQrCodeForm: React.FC<CreateQrCodeFormProps> = ({
  venueId,
  menus,
  tables,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      venueId,
      menuId: menus.length > 0 ? menus[0].id : '',
      tableId: 'none', // Default to "none" for no table
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Set venue ID when it changes
  useEffect(() => {
    form.setValue('venueId', venueId);
  }, [venueId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const data: CreateQrCodeData = {
        venueId: values.venueId,
        menuId: values.menuId,
        name: values.name,
        isActive: values.isActive,
      };

      // Only add tableId if it's a valid table ID (not "none")
      if (values.tableId && values.tableId !== 'none') {
        data.tableId = values.tableId;
      }

      if (values.description) {
        data.description = values.description;
      }

      const result = await qrCodeService.createQrCode(data);

      toast.success('QR code created successfully');

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error('Failed to create QR code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="menuId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a menu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the menu that will be displayed when this QR code is scanned.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tableId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No table (venue QR code)</SelectItem>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Link this QR code to a specific table or leave empty for a general venue QR code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter QR code name"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                A name to identify this QR code.
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
                  placeholder="Enter description"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Additional information about this QR code.
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
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  When active, this QR code can be scanned by customers.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create QR Code'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateQrCodeForm;
