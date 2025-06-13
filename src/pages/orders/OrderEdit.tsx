import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { useMenu } from '@/contexts/menu-context';
import { useOrder } from '@/hooks/useOrder';
import { CreateOrderItemDto, OrderStatus, UpdateOrderDto, Order } from '@/services/order-service';
import MenuItemSelector from '@/components/orders/menu-item-selector';
import OrderSummary from '@/components/orders/order-summary';
import PartySizeInput from '@/components/orders/PartySizeInput';
import { toast } from 'sonner';
import { orderKeys } from '@/hooks/useOrderQuery';
import { OrganizationType } from '@/types/organization';

// Form schema
const orderFormSchema = z.object({
  tableId: z.union([z.string().uuid(), z.literal('none')]),
  customerName: z.string().optional(),
  customerEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  roomNumber: z.string().optional(),
  partySize: z.number().min(1, { message: 'Party size must be at least 1' }).optional(),
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
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { venues, tables, fetchVenuesForOrganization, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();
  const { currentOrder, fetchOrderById, updateOrder, isLoading, selectOrder } = useOrder();

  const [selectedItems, setSelectedItems] = useState<CreateOrderItemDto[]>([]);
  const [itemsToRemove, setItemsToRemove] = useState<string[]>([]);
  const [itemsToUpdate, setItemsToUpdate] = useState<{itemId: string, quantity: number, notes?: string}[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get organization type for conditional field rendering
  const organizationType = currentOrganization?.type;

  // Helper functions to determine field visibility
  const shouldShowTableSelection = organizationType !== OrganizationType.FOOD_TRUCK;
  const shouldShowRoomNumber = organizationType === OrganizationType.HOTEL;
  const shouldShowPartySize = organizationType !== OrganizationType.FOOD_TRUCK;

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      tableId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      roomNumber: '',
      partySize: undefined,
      notes: '',
      status: OrderStatus.PENDING
    }
  });

  // Load order data - use existing data from context if available and avoid API calls
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) return;

      try {
        // First check if we already have the order in the context
        if (currentOrder && currentOrder.id === orderId) {
          console.log('Using existing order data from context:', currentOrder);

          // Log table information for debugging
          console.log('Order table data:', {
            tableId: currentOrder.tableId,
            tableName: currentOrder.table?.name,
            venueId: currentOrder.table?.venue?.id,
            venueName: currentOrder.table?.venue?.name
          });

          // Set form values immediately since we already have the data
          const formValues = {
            tableId: currentOrder.tableId || 'none',
            customerName: currentOrder.customerName || '',
            customerEmail: currentOrder.customerEmail || '',
            customerPhone: currentOrder.customerPhone || '',
            roomNumber: currentOrder.roomNumber || '',
            partySize: currentOrder.partySize || undefined,
            notes: currentOrder.notes || '',
            status: currentOrder.status
          };

          console.log('Setting form values from existing data:', formValues);
          form.reset(formValues);

          // Manually set each field value to ensure they're updated
          Object.entries(formValues).forEach(([key, value]) => {
            form.setValue(key as any, value);
          });

          // Set selected items
          if (currentOrder.items && currentOrder.items.length > 0) {
            console.log('Order items found:', currentOrder.items.length);
            const orderItems: CreateOrderItemDto[] = currentOrder.items.map(item => ({
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

          return; // Exit early since we already have the data
        }

        // Check if we have the order in the cache before making an API call
        const cachedOrder = queryClient.getQueryData<Order>(orderKeys.detail(orderId));

        if (cachedOrder) {
          console.log('Using cached order data:', cachedOrder.id);

          // Set the current order ID to trigger the context update
          selectOrder(cachedOrder);

          // Log table information for debugging
          console.log('Order table data from cache:', {
            tableId: cachedOrder.tableId,
            tableName: cachedOrder.table?.name,
            venueId: cachedOrder.table?.venue?.id,
            venueName: cachedOrder.table?.venue?.name
          });

          // Set form values immediately since we already have the data
          const formValues = {
            tableId: cachedOrder.tableId || 'none',
            customerName: cachedOrder.customerName || '',
            customerEmail: cachedOrder.customerEmail || '',
            customerPhone: cachedOrder.customerPhone || '',
            roomNumber: cachedOrder.roomNumber || '',
            partySize: cachedOrder.partySize || undefined,
            notes: cachedOrder.notes || '',
            status: cachedOrder.status
          };

          console.log('Setting form values from cached data:', formValues);
          form.reset(formValues);

          // Manually set each field value to ensure they're updated
          Object.entries(formValues).forEach(([key, value]) => {
            form.setValue(key as any, value);
          });

          // Set selected items
          if (cachedOrder.items && cachedOrder.items.length > 0) {
            console.log('Order items found in cache:', cachedOrder.items.length);
            const orderItems: CreateOrderItemDto[] = cachedOrder.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              notes: item.notes || '',
              modifiers: item.modifiers?.map(mod => ({
                modifierId: mod.modifierId
              })) || []
            }));
            setSelectedItems(orderItems);
          } else {
            console.log('No order items found in cache');
            setSelectedItems([]);
          }

          return; // Exit early since we already have the data
        }

        // If we don't have the order in context or cache, fetch it from API
        // This should rarely happen if our caching is working correctly
        console.log('No cached data found, fetching order data for ID:', orderId);
        const order = await fetchOrderById(orderId);

        if (!order) {
          console.error('Failed to fetch order data or order is null');
          toast.error('Could not load order data. Please try again.');
          return;
        }

        // Log table information for debugging
        console.log('Order table data from API:', {
          tableId: order.tableId,
          tableName: order.table?.name,
          venueId: order.table?.venue?.id,
          venueName: order.table?.venue?.name
        });

        // Set form values
        const formValues = {
          tableId: order.tableId || 'none',
          customerName: order.customerName || '',
          customerEmail: order.customerEmail || '',
          customerPhone: order.customerPhone || '',
          roomNumber: order.roomNumber || '',
          partySize: order.partySize || undefined,
          notes: order.notes || '',
          status: order.status
        };

        console.log('Setting form values from API data:', formValues);
        form.reset(formValues);

        // Manually set each field value to ensure they're updated
        Object.entries(formValues).forEach(([key, value]) => {
          form.setValue(key as any, value);
        });

        // Set selected items
        if (order.items && order.items.length > 0) {
          console.log('Order items found from API:', order.items.length);
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
          console.log('No order items found from API');
          setSelectedItems([]);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Error loading order data. Please try again.');
      }
    };

    loadOrderData();
  }, [orderId, currentOrder, fetchOrderById, form, queryClient, selectOrder, orderKeys]);

  // Load venues, menus, and tables - but only if they're not already loaded
  useEffect(() => {
    if (!organizationId) return;

    // Check if we already have the necessary data in the cache
    const venueIdToUse = currentOrder?.table?.venue?.id || venueId;

    // First, check if we need to load venues
    if (venues.length === 0) {
      console.log('Checking cache for venues before fetching');
      // Check if venues are in the cache
      const venuesQueryKey = ['venues', 'organization', organizationId];
      const cachedVenues = queryClient.getQueryData(venuesQueryKey);

      if (!cachedVenues) {
        console.log('No venues in cache, fetching venues for organization:', organizationId);
        // Use fetchQuery instead of the context function to have more control
        queryClient.fetchQuery({
          queryKey: venuesQueryKey,
          queryFn: () => fetchVenuesForOrganization(organizationId),
          staleTime: 10 * 60 * 1000 // 10 minutes
        });
      } else {
        console.log('Using cached venues data');
      }
    } else {
      console.log('Using existing venues data from context:', venues.length, 'venues');
    }

    // Check if we need to load menus
    if (menus.length === 0) {
      console.log('Checking cache for menus before fetching');
      // Check if menus are in the cache
      const menusQueryKey = ['menus', 'organization', organizationId];
      const cachedMenus = queryClient.getQueryData(menusQueryKey);

      if (!cachedMenus) {
        console.log('No menus in cache, fetching menus for organization:', organizationId);
        // Use fetchQuery instead of the context function to have more control
        queryClient.fetchQuery({
          queryKey: menusQueryKey,
          queryFn: () => fetchMenusForOrganization(organizationId),
          staleTime: 10 * 60 * 1000 // 10 minutes
        });
      } else {
        console.log('Using cached menus data');
      }
    } else {
      console.log('Using existing menus data from context:', menus.length, 'menus');
    }

    // Check if we need to load tables
    if (venueIdToUse) {
      const hasTablesForVenue = tables.length > 0 && tables[0].venueId === venueIdToUse;

      if (!hasTablesForVenue) {
        console.log('Checking cache for tables before fetching');
        // Check if tables are in the cache
        const tablesQueryKey = ['tables', 'venue', venueIdToUse];
        const cachedTables = queryClient.getQueryData(tablesQueryKey);

        if (!cachedTables) {
          console.log('No tables in cache, fetching tables for venue:', venueIdToUse);
          // Use fetchQuery instead of the context function to have more control
          queryClient.fetchQuery({
            queryKey: tablesQueryKey,
            queryFn: () => fetchTablesForVenue(venueIdToUse),
            staleTime: 10 * 60 * 1000 // 10 minutes
          });
        } else {
          console.log('Using cached tables data');
        }
      } else {
        console.log('Using existing tables data from context:', tables.length, 'tables');
      }
    }
  }, [organizationId, venueId, currentOrder, venues, menus, tables, queryClient, fetchVenuesForOrganization, fetchMenusForOrganization, fetchTablesForVenue]);

  // Handle form submission
  const onSubmit = async (data: OrderFormValues) => {
    console.log('Form submission data:', data);
    console.log('Current form values:', form.getValues());
    console.log('Selected items:', selectedItems);
    console.log('Items to remove:', itemsToRemove);
    console.log('Items to update:', itemsToUpdate);

    if (selectedItems.length === 0 && itemsToRemove.length === 0 && itemsToUpdate.length === 0) {
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
      removeItemIds: itemsToRemove,
      updateItems: itemsToUpdate
    };

    try {
      const updatedOrder = await updateOrder(orderId!, updateData);

      if (updatedOrder) {
        // Toast is already handled by the React Query mutation success callback
        if (venueId) {
          navigate(`/organizations/${organizationId}/venues/${venueId}/orders/${orderId}`);
        } else {
          navigate(`/organizations/${organizationId}/orders/${orderId}`);
        }
      } else {
        toast.error('Failed to update order. Please try again.');
      }
    } catch (error) {
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

  // Handle updating quantity for existing item
  const handleUpdateItemQuantity = (itemId: string, newQuantity: number, notes?: string) => {
    setItemsToUpdate(prev => {
      const existingIndex = prev.findIndex(item => item.itemId === itemId);
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = { itemId, quantity: newQuantity, notes };
        return updated;
      } else {
        // Add new entry
        return [...prev, { itemId, quantity: newQuantity, notes }];
      }
    });
  };

  // Handle canceling an item update
  const handleCancelItemUpdate = (itemId: string) => {
    setItemsToUpdate(prev => prev.filter(item => item.itemId !== itemId));
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

                      {/* Table Selection - Hidden for Food Trucks */}
                      {shouldShowTableSelection && (
                        <FormField
                          control={form.control}
                          name="tableId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Table (Optional)</FormLabel>
                              <Select
                                value={field.value || 'none'}
                                onValueChange={(value) => {
                                  console.log('Table selection changed to:', value);
                                  field.onChange(value === 'none' ? '' : value);
                                }}
                                disabled={tables.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={tables.length === 0 ? "Loading tables..." : "Select a table"}>
                                      {field.value && field.value !== 'none' ?
                                        tables.find(t => t.id === field.value)?.name || "Loading table..." :
                                        "No table selected"}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No table</SelectItem>
                                  {tables.map((table) => (
                                    <SelectItem key={table.id} value={table.id}>
                                      {table.name}
                                    </SelectItem>
                                  ))}
                                  {tables.length === 0 && (
                                    <SelectItem value="none" disabled>No tables available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {tables.length > 0 ?
                                  "Select a table for dine-in orders" :
                                  "Tables will appear here once loaded"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Party Size - Hidden for Food Trucks */}
                      {shouldShowPartySize && (
                        <FormField
                          control={form.control}
                          name="partySize"
                          render={({ field }) => {
                            const selectedTable = tables.find(t => t.id === form.watch('tableId'));
                            return (
                              <FormItem>
                                <PartySizeInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  tableCapacity={selectedTable?.capacity}
                                  label="Party Size"
                                  placeholder="Number of guests"
                                  showQuickButtons={true}
                                />
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      )}
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

                        {/* Room Number - Only for Hotels */}
                        {shouldShowRoomNumber && (
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
                        )}
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
                        {currentOrder.items.map((item) => {
                          const isMarkedForRemoval = itemsToRemove.includes(item.id);
                          const updateInfo = itemsToUpdate.find(update => update.itemId === item.id);
                          const currentQuantity = updateInfo?.quantity ?? item.quantity;
                          const currentNotes = updateInfo?.notes ?? item.notes;

                          return (
                            <div key={item.id} className={`p-4 border rounded-md ${isMarkedForRemoval ? 'bg-red-50 border-red-200' : ''}`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{item.menuItem?.name}</div>
                                  {item.menuItem?.price && (
                                    <div className="text-sm text-muted-foreground">
                                      ${parseFloat(item.menuItem.discountPrice || item.menuItem.price).toFixed(2)} each
                                    </div>
                                  )}
                                </div>

                                {!isMarkedForRemoval && (
                                  <div className="flex items-center gap-2">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const newQuantity = Math.max(1, currentQuantity - 1);
                                          handleUpdateItemQuantity(item.id, newQuantity, currentNotes);
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const newQuantity = currentQuantity + 1;
                                          handleUpdateItemQuantity(item.id, newQuantity, currentNotes);
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Notes */}
                              {(currentNotes || updateInfo) && (
                                <div className="mt-2">
                                  <Input
                                    placeholder="Add notes for this item..."
                                    value={currentNotes || ''}
                                    onChange={(e) => {
                                      handleUpdateItemQuantity(item.id, currentQuantity, e.target.value);
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                              )}

                              {/* Status indicators */}
                              <div className="mt-2 flex items-center gap-2">
                                {updateInfo && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {updateInfo.quantity !== item.quantity ? `Qty: ${item.quantity} → ${updateInfo.quantity}` : 'Notes updated'}
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCancelItemUpdate(item.id)}
                                      className="text-xs h-6 px-2"
                                    >
                                      Cancel changes
                                    </Button>
                                  </div>
                                )}
                                {isMarkedForRemoval && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="destructive" className="text-xs">
                                      Marked for removal
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setItemsToRemove(prev => prev.filter(id => id !== item.id))}
                                      className="text-xs h-6 px-2"
                                    >
                                      Keep item
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                        .map(item => {
                          // Check if this item has quantity updates
                          const updateInfo = itemsToUpdate.find(update => update.itemId === item.id);
                          return {
                            menuItemId: item.menuItemId,
                            quantity: updateInfo?.quantity ?? item.quantity,
                            notes: updateInfo?.notes ?? (item.notes || ''),
                            modifiers: item.modifiers?.map(mod => ({
                              modifierId: mod.modifierId
                            })) || []
                          };
                        }) || [],
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
