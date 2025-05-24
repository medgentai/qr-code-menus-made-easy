import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { UpdateMenuDto } from '@/services/menu-service';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Menu name must be at least 2 characters.',
  }).max(50, {
    message: 'Menu name must not exceed 50 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must not exceed 500 characters.',
  }).optional().nullable(),
  isActive: z.boolean().default(true),
});

const MenuEdit: React.FC = () => {
  const { id: organizationId, menuId } = useParams<{ id: string; menuId: string }>();
  const navigate = useNavigate();
  const { fetchMenuById, updateMenu, deleteMenu, isLoading, currentMenu } = useMenu();
  const { currentOrganization } = useOrganization();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuName, setMenuName] = useState<string>('');

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Load menu data
  useEffect(() => {
    const loadMenu = async () => {
      if (menuId) {
        const menu = await fetchMenuById(menuId);
        if (menu) {
          setMenuName(menu.name);
          form.reset({
            name: menu.name,
            description: menu.description || '',
            isActive: menu.isActive,
          });
        }
      }
    };
    loadMenu();
  }, [menuId, fetchMenuById, form]);

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!menuId) {
      toast.error('Menu ID is missing');
      return;
    }

    const menuData: UpdateMenuDto = {
      ...values,
    };

    const updatedMenu = await updateMenu(menuId, menuData);
    if (updatedMenu) {
      navigate(`/organizations/${organizationId}/menus/${menuId}`);
    }
  };

  const handleDeleteMenu = async () => {
    if (menuId) {
      const success = await deleteMenu(menuId);
      if (success) {
        navigate(`/organizations/${organizationId}/menus`);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}`}>{currentOrganization?.name}</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/menus`}>Menus</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/menus/${menuId}`}>{menuName}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Edit</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Menu</h1>
          <p className="text-muted-foreground mt-1">
            Update details for {menuName}
          </p>
        </div>

        <Separator />

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Menu Details</CardTitle>
            <CardDescription>
              Edit the information for your menu
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
                          value={field.value || ''}
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
                          Make this menu visible to customers.
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

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete Menu
                  </Button>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this menu and all its categories and items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMenu} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MenuEdit;
