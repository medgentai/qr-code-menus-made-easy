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
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { useOrder } from '@/hooks/useOrder';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus, UpdateOrderDto } from '@/services/order-service';
import MenuItemSelector from '@/components/orders/menu-item-selector';
import OrderSummary from '@/components/orders/order-summary';
import { toast } from '@/components/ui/sonner';

// Form schema
const orderFormSchema = z.object({
  tableId: z.union([z.string().uuid(), z.literal('none')]),
  customerName: z.string().optional(),
  customerEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(OrderStatus)
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const OrderEdit: React.FC = () => {
  const { id: organizationId, venueId, orderId } = useParams<{
    id: string;
    venueId?: string;
    orderId: string;
  }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentVenue, venues, tables, fetchVenuesForOrganization, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();
  const { currentOrder, fetchOrderById, updateOrder, isLoading } = useOrder();

  const [selectedItems, setSelectedItems] = useState<CreateOrderItemDto[]>([]);
  const [itemsToRemove, setItemsToRemove] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      tableId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      roomNumber: '',
      notes: '',
      status: OrderStatus.PENDING
    }
  });

  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) return;

      try {
        console.log('Fetching order data for ID:', orderId);
        // Force a direct API call instead of using the cache
        const order = await fetchOrderById(orderId);
        console.log('Order data received:', order);

        if (!order) {
          console.error('Failed to fetch order data or order is null');
          toast.error('Could not load order data. Please try again.');
          return;
        }

        // Set form values with a slight delay to ensure React has time to process
        setTimeout(() => {
          const formValues = {
            tableId: order.tableId || 'none',
            customerName: order.customerName || '',
            customerEmail: order.customerEmail || '',
            customerPhone: order.customerPhone || '',
            roomNumber: order.roomNumber || '',
            notes: order.notes || '',
            status: order.status
          };
          console.log('Setting form values:', formValues);
          form.reset(formValues);

          // Manually set each field value to ensure they're updated
          Object.entries(formValues).forEach(([key, value]) => {
            form.setValue(key as any, value);
          });
        }, 100);

        // Set selected items
        if (order.items && order.items.length > 0) {
          console.log('Order items found:', order.items.length);
          const orderItems: CreateOrderItemDto[] = order.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes || '',
            modifiers: item.modifiers?.map(mod => ({
              modifierId: mod.modifierId
            })) || []
          }));
          setSelectedItems(orderItems);
        } else {
          console.log('No order items found');
          setSelectedItems([]);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Error loading order data. Please try again.');
      }
    };

    loadOrderData();
  }, [orderId, fetchOrderById, form]);

  // Load venues, menus, and tables
  useEffect(() => {
    if (organizationId) {
      fetchVenuesForOrganization(organizationId);
      fetchMenusForOrganization(organizationId);
    }
  }, [organizationId, fetchVenuesForOrganization, fetchMenusForOrganization]);

  // Load tables when venue changes
  useEffect(() => {
    if (currentOrder?.table?.venue?.id) {
      fetchTablesForVenue(currentOrder.table.venue.id);
    } else if (venueId) {
      fetchTablesForVenue(venueId);
    }
  }, [currentOrder, venueId, fetchTablesForVenue]);

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    console.log('Form submission data:', data);
    console.log('Current form values:', form.getValues());
    console.log('Selected items:', selectedItems);
    console.log('Items to remove:', itemsToRemove);

    if (selectedItems.length === 0 && itemsToRemove.length === 0) {
      toast.error('Please add at least one item to the order or make changes to the order details');
      return;
    }

    setIsSubmitting(true);

    const updateData: UpdateOrderDto = {
      ...data,
      tableId: data.tableId === 'none' ? undefined : data.tableId || undefined,
      addItems: selectedItems.filter(item =>
        !currentOrder?.items?.some(orderItem => orderItem.menuItemId === item.menuItemId)
      ),
      removeItemIds: itemsToRemove
    };

    console.log('Update data being sent to API:', updateData);

    try {
      console.log('Calling updateOrder with orderId:', orderId);
      const updatedOrder = await updateOrder(orderId!, updateData);
      console.log('Update order response:', updatedOrder);

      if (updatedOrder) {
        toast.success('Order updated successfully');
        if (venueId) {
          navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}`);
        } else {
          navigate(`/organizations/${organizationId}/orders/${orderId}`);
        }
      } else {
        console.error('Updated order is null');
        toast.error('Failed to update order. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Error updating order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (venueId) {
      navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}`);
    } else {
      navigate(`/organizations/${organizationId}/orders/${orderId}`);
    }
  };

  // Get active menu for the venue
  const getActiveMenuForVenue = () => {
    if (!menus.length) return null;

    const venueIdToUse = venueId || currentOrder?.table?.venue?.id;
    if (!venueIdToUse) return null;

    return menus.find(menu => menu.isActive);
  };

  const activeMenu = getActiveMenuForVenue();

  // Handle removing an item
  const handleRemoveItem = (itemId: string) => {
    setItemsToRemove(prev => [...prev, itemId]);
  };

  // Handle adding a new item
  const handleAddItem = (item: CreateOrderItemDto) => {
    setSelectedItems(prev => [...prev, item]);
  };

  if (!currentOrder) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading order...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the order details.</p>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Order {currentOrder?.id ? `#${currentOrder.id.substring(0, 8)}` : ''}</h1>
          </div>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="summary">Order Summary</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                      Update the basic information for this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Venue Information (read-only) */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Venue</h3>
                        <div className="p-2 border rounded-md bg-muted/20">
                          {currentOrder.table?.venue?.name || 'No venue information'}
                        </div>
                      </div>

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
                                <Input
                                  placeholder="John Doe"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    console.log('Customer name changed to:', e.target.value);
                                  }}
                                />
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
                                <Input
                                  placeholder="john.doe@example.com"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    console.log('Customer email changed to:', e.target.value);
                                  }}
                                />
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
                                <Input
                                  placeholder="+1 (555) 123-4567"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    console.log('Customer phone changed to:', e.target.value);
                                  }}
                                />
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
                                <Input
                                  placeholder="101"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    console.log('Room number changed to:', e.target.value);
                                  }}
                                />
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
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e);
                                console.log('Notes changed to:', e.target.value);
                              }}
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
                            onValueChange={(value) => {
                              field.onChange(value);
                              console.log('Status changed to:', value);
                            }}
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
                    <CardTitle>Current Items</CardTitle>
                    <CardDescription>
                      Current items in this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      <div className="space-y-4">
                        {currentOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{item.quantity}x {item.menuItem?.name}</div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground">Note: {item.notes}</div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className={itemsToRemove.includes(item.id) ? 'bg-red-100' : ''}
                            >
                              {itemsToRemove.includes(item.id) ? 'Marked for Removal' : 'Remove'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No items in this order</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Items</CardTitle>
                    <CardDescription>
                      Add new items to this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!activeMenu ? (
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
                    venueId: currentOrder.table?.venue?.id || '',
                    items: [
                      ...currentOrder.items
                        ?.filter(item => !itemsToRemove.includes(item.id))
                        .map(item => ({
                          menuItemId: item.menuItemId,
                          quantity: item.quantity,
                          notes: item.notes || '',
                          modifiers: item.modifiers?.map(mod => ({
                            modifierId: mod.modifierId
                          })) || []
                        })) || [],
                      ...selectedItems
                    ]
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

export default OrderEdit;
