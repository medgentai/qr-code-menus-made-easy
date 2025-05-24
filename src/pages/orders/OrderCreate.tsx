import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus } from '@/services/order-service';
import { useCreateOrderMutation } from '@/hooks/useOrderQuery';
import MenuItemSelector from '@/components/orders/menu-item-selector';
import OrderSummary from '@/components/orders/order-summary';
import { toast } from 'sonner';

// Form schema
const orderFormSchema = z.object({
  venueId: z.string().uuid({ message: 'Please select a venue' }),
  tableId: z.union([z.string().uuid(), z.literal('none')]),
  customerName: z.string().optional(),
  customerEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional()
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const OrderCreate: React.FC = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId?: string }>();
  const navigate = useNavigate();
  const { venues, tables, fetchVenuesForOrganization, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();
  const createOrderMutation = useCreateOrderMutation();

  const [selectedItems, setSelectedItems] = useState<CreateOrderItemDto[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      venueId: venueId || '',
      tableId: 'none',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      roomNumber: '',
      notes: '',
      status: OrderStatus.PENDING
    }
  });

  // Load venues and tables
  useEffect(() => {
    if (organizationId) {
      fetchVenuesForOrganization(organizationId);
      fetchMenusForOrganization(organizationId);
    }
  }, [organizationId, fetchVenuesForOrganization, fetchMenusForOrganization]);

  // Load tables when venue changes
  useEffect(() => {
    const venueIdValue = form.watch('venueId');
    if (venueIdValue) {
      fetchTablesForVenue(venueIdValue);
    }
  }, [form.watch('venueId'), fetchTablesForVenue]);

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item to the order');
      setActiveTab('items');
      return;
    }

    setIsSubmitting(true);

    const orderData: CreateOrderDto = {
      venueId: data.venueId, // Explicitly include venueId as it's required
      tableId: data.tableId === 'none' ? undefined : data.tableId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      roomNumber: data.roomNumber,
      notes: data.notes,
      status: data.status,
      items: selectedItems
    };

    try {
      createOrderMutation.mutate(orderData, {
        onSuccess: (newOrder) => {
          // Navigate to the new order
          if (venueId) {
            navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${newOrder.id}`);
          } else {
            navigate(`/organizations/${organizationId}/orders/${newOrder.id}`);
          }
          setIsSubmitting(false);
        },
        onError: (error) => {
          console.error('Failed to create order:', error);
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders`);
    } else {
      navigate(`/organizations/${organizationId}/orders`);
    }
  };

  // Get active menu for the selected venue
  const getActiveMenuForVenue = () => {
    const venueIdValue = form.watch('venueId');
    if (!venueIdValue || !menus.length) return null;

    return menus.find(menu => menu.isActive);
  };

  const activeMenu = getActiveMenuForVenue();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Create New Order</h1>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || createOrderMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="summary">Order Summary</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form>
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                      Enter the basic information for this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Venue Selection */}
                      <FormField
                        control={form.control}
                        name="venueId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!!venueId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a venue" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {venues.map((venue) => (
                                  <SelectItem key={venue.id} value={venue.id}>
                                    {venue.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Table Selection */}
                      <FormField
                        control={form.control}
                        name="tableId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table (Optional)</FormLabel>
                            <Select
                              value={field.value || 'none'}
                              onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a table" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No table</SelectItem>
                                {tables.map((table) => (
                                  <SelectItem key={table.id} value={table.id}>
                                    {table.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select a table for dine-in orders
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Name */}
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Customer Email */}
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Customer Phone */}
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Room Number */}
                        <FormField
                          control={form.control}
                          name="roomNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Number</FormLabel>
                              <FormControl>
                                <Input placeholder="101" {...field} />
                              </FormControl>
                              <FormDescription>
                                For hotel room service orders
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Order Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any special instructions for the entire order"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Order Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(OrderStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>
                      Select items from the menu to add to this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!form.watch('venueId') ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Please select a venue first</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab('details')}
                        >
                          Go to Order Details
                        </Button>
                      </div>
                    ) : !activeMenu ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No active menu found for this venue</p>
                      </div>
                    ) : (
                      <MenuItemSelector
                        categories={activeMenu.categories || []}
                        selectedItems={selectedItems}
                        onItemsChange={setSelectedItems}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4 mt-4">
                <OrderSummary
                  orderData={{
                    ...form.getValues(),
                    items: selectedItems
                  }}
                  categories={activeMenu?.categories || []}
                />
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </>
  );
};

export default OrderCreate;
