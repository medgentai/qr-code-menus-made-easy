import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMenu } from '@/contexts/menu-context';
import { CreateMenuDto } from '@/services/menu-service';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Menu name must be at least 2 characters.',
  }).max(50, {
    message: 'Menu name must not exceed 50 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must not exceed 500 characters.',
  }).optional(),
  isActive: z.boolean().default(true),
});

const MenuCreate: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createMenu, isLoading } = useMenu();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!organizationId) {
      toast.error('Organization ID is missing');
      return;
    }

    const menuData: CreateMenuDto = {
      ...values,
      organizationId,
    };

    const newMenu = await createMenu(menuData);
    if (newMenu) {
      navigate(`/organizations/${organizationId}/menus/${newMenu.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Menu</h1>
          <p className="text-muted-foreground">
            Create a new digital menu for your organization
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Menu Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new menu
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
                      <FormLabel>Menu Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dinner Menu" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed to customers.
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
                          placeholder="Describe your menu..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description to provide additional context about this menu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Removed date fields as they are unnecessary */}

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this menu visible to customers immediately.
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${organizationId}/menus`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Menu
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuCreate;
