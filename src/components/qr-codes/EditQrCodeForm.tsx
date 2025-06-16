import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { qrCodeService, QrCode, UpdateQrCodeData } from '@/services/qrCodeService';
import { useNavigate } from 'react-router-dom';

// Define form schema with Zod
const formSchema = z.object({
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

interface EditQrCodeFormProps {
  qrCode: QrCode;
  venueId: string;
  menus: Menu[];
  tables: Table[];
  onSuccess?: () => void;
}

const EditQrCodeForm: React.FC<EditQrCodeFormProps> = ({
  qrCode,
  menus,
  tables,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      menuId: qrCode.menuId,
      tableId: qrCode.tableId || 'none',
      name: qrCode.name,
      description: qrCode.description || '',
      isActive: qrCode.isActive,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const data: UpdateQrCodeData = {
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

      await qrCodeService.updateQrCode(qrCode.id, data);

      toast.success('QR code updated successfully');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast.error('Failed to update QR code');
    } finally {
      setIsSubmitting(false);
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter QR code name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this QR code
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
                  placeholder="Enter a description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional information about this QR code
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="menuId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
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
                The menu that will be displayed when this QR code is scanned
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
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
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
                If this QR code is for a specific table, select it here
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
                  When active, this QR code can be scanned by customers
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
            {isSubmitting ? 'Updating...' : 'Update QR Code'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditQrCodeForm;
