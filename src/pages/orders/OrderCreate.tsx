import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Utensils, FileText, Store, Users, Phone, Mail, MapPin } from 'lucide-react';
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
import { useOrganization } from '@/contexts/organization-context';
import { usePermissions } from '@/contexts/permission-context';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus } from '@/services/order-service';
import { useCreateOrderMutation } from '@/hooks/useOrderQuery';
import MenuItemSelector from '@/components/orders/menu-item-selector';
import OrderSummary from '@/components/orders/order-summary';
import PartySizeInput from '@/components/orders/PartySizeInput';
import { toast } from 'sonner';
import { OrganizationType } from '@/types/organization';

// Form schema
const orderFormSchema = z.object({
  venueId: z.string().min(1, { message: 'Venue is required' }),
  tableId: z.union([z.string().uuid(), z.literal('none')]),
  customerName: z.string().optional(),
  customerEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  roomNumber: z.string().optional(),
  partySize: z.number().min(1, { message: 'Party size must be at least 1' }).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional()
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const OrderCreate: React.FC = () => {
  const { id: organizationId, venueId } = useParams<{ id: string; venueId?: string }>();
  const navigate = useNavigate();
  const { venues, tables, currentVenue, fetchVenuesForOrganization, fetchTablesForVenue } = useVenue();
  const { menus, fetchMenusForOrganization } = useMenu();
  const { currentOrganization } = useOrganization();
  const { userRole, userVenueIds } = usePermissions();
  const createOrderMutation = useCreateOrderMutation();

  const [selectedItems, setSelectedItems] = useState<CreateOrderItemDto[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get organization type for conditional field rendering
  const organizationType = currentOrganization?.type;

  // Helper functions to determine field visibility
  const shouldShowTableSelection = organizationType !== OrganizationType.FOOD_TRUCK;
  const shouldShowRoomNumber = organizationType === OrganizationType.HOTEL;
  const shouldShowPartySize = organizationType !== OrganizationType.FOOD_TRUCK;

  // Determine the venue to use based on user role and assignments
  const getDefaultVenueId = () => {
    // If venueId is provided in URL, use it
    if (venueId) return venueId;

    // If user is staff with venue assignments, use their assigned venue
    if (userRole === 'STAFF' && userVenueIds && userVenueIds.length > 0) {
      // If staff has only one venue assigned, use it automatically
      if (userVenueIds.length === 1) {
        return userVenueIds[0];
      }
      // If staff has multiple venues, use the current venue if it's in their assignments
      if (currentVenue && userVenueIds.includes(currentVenue.id)) {
        return currentVenue.id;
      }
      // Otherwise use the first assigned venue
      return userVenueIds[0];
    }

    // For non-staff roles, no default venue
    return '';
  };

  // Check if venue selection should be shown
  const shouldShowVenueSelection = () => {
    // Never show venue selection if venueId is in URL
    if (venueId) return false;

    // For staff members, only show if they have multiple venue assignments
    if (userRole === 'STAFF' && userVenueIds) {
      return userVenueIds.length > 1;
    }

    // For non-staff roles, always show venue selection
    return userRole !== 'STAFF';
  };

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      venueId: getDefaultVenueId(),
      tableId: 'none',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      roomNumber: '',
      partySize: undefined,
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

  // Update form venue when user's assigned venue is determined
  useEffect(() => {
    const defaultVenueId = getDefaultVenueId();
    if (defaultVenueId && form.getValues('venueId') !== defaultVenueId) {
      form.setValue('venueId', defaultVenueId);
    }
  }, [currentVenue, userVenueIds, venueId, form]);

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
      partySize: data.partySize,
      notes: data.notes,
      status: data.status,
      items: selectedItems
    };

    try {
      createOrderMutation.mutate(orderData, {
        onSuccess: () => {
          // Navigate to the orders list page to see the new order
          if (venueId) {
            navigate(`/organizations/${organizationId}/venues/${venueId}/orders`);
          } else {
            navigate(`/organizations/${organizationId}/orders`);
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
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Create New Order
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add order details, select menu items, and review before creating
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleBack}
            className="hidden sm:flex"
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || createOrderMutation.isPending}
            className="min-w-[140px]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0 rounded-none">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent py-4 px-6 font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Order Details</span>
                  <span className="sm:hidden">Details</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent py-4 px-6 font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Menu Items</span>
                  <span className="sm:hidden">Items</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent py-4 px-6 font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Summary</span>
                  <span className="sm:hidden">Review</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <Form {...form}>
            <form className="space-y-8">
              <TabsContent value="details" className="mt-8 space-y-8">
                {/* Venue & Table Information */}
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Store className="h-5 w-5 text-blue-600" />
                      Venue & Table Information
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Select the venue and table for this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Venue Selection - Only show when needed */}
                      {shouldShowVenueSelection() ? (
                        <FormField
                          control={form.control}
                          name="venueId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Venue *
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!!venueId}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select a venue" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* For staff with multiple venues, only show their assigned venues */}
                                  {(userRole === 'STAFF' && userVenueIds ?
                                    venues.filter(venue => userVenueIds.includes(venue.id)) :
                                    venues
                                  ).map((venue) => (
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
                      ) : (
                        /* Show current venue info when venue is auto-selected */
                        <div className="space-y-2">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Venue
                          </FormLabel>
                          <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                            <Store className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {venues.find(v => v.id === form.watch('venueId'))?.name || 'Loading...'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                              Auto-selected
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {userRole === 'STAFF' ? 'Based on your venue assignment' : 'From URL parameter'}
                          </p>
                        </div>
                      )}

                      {/* Table Selection - Hidden for Food Trucks */}
                      {shouldShowTableSelection && (
                        <FormField
                          control={form.control}
                          name="tableId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Table (Optional)
                              </FormLabel>
                              <Select
                                value={field.value || 'none'}
                                onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">No table assigned</SelectItem>
                                  {tables.map((table) => (
                                    <SelectItem key={table.id} value={table.id}>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {table.name}
                                        {table.capacity && (
                                          <span className="text-xs text-gray-500">
                                            (Seats {table.capacity})
                                          </span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-xs text-gray-500">
                                Select a table for dine-in orders
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Party Size - Hidden for Food Trucks */}
                    {shouldShowPartySize && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <FormField
                          control={form.control}
                          name="partySize"
                          render={({ field }) => {
                            const selectedTable = tables.find(t => t.id === form.watch('tableId'));
                            return (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  Party Size
                                </FormLabel>
                                <div className="max-w-md">
                                  <PartySizeInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    tableCapacity={selectedTable?.capacity}
                                    label=""
                                    placeholder="Number of guests"
                                    showQuickButtons={true}
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Enter customer details for this order (optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Name */}
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              Customer Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                className="h-11"
                                {...field}
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
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              Customer Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                className="h-11"
                                {...field}
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
                            <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              Customer Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="john.doe@example.com"
                                type="email"
                                className="h-11"
                                {...field}
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
                              <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                Room Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="101"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                For hotel room service orders
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes & Settings */}
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Order Notes & Settings
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Add special instructions and set the initial order status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Order Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Order Notes
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any special instructions for the entire order..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            These notes will be visible to kitchen staff and servers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Order Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Initial Order Status
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select initial status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(OrderStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${
                                        status === 'PENDING' ? 'bg-yellow-500' :
                                        status === 'CONFIRMED' ? 'bg-blue-500' :
                                        status === 'PREPARING' ? 'bg-orange-500' :
                                        status === 'READY' ? 'bg-green-500' :
                                        status === 'SERVED' ? 'bg-purple-500' :
                                        status === 'COMPLETED' ? 'bg-gray-500' :
                                        status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'
                                      }`} />
                                      {status}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs text-gray-500">
                              Usually set to "PENDING" for new orders
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="mt-8">
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-blue-600" />
                      Menu Items
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Select items from the menu to add to this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {!form.watch('venueId') ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Store className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Venue First</h3>
                        <p className="text-gray-600 mb-6">Please select a venue in the Order Details tab to view available menu items.</p>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                          className="inline-flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Go to Order Details
                        </Button>
                      </div>
                    ) : !activeMenu ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Utensils className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Menu</h3>
                        <p className="text-gray-600">No active menu found for this venue. Please contact your administrator.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Available Items</h3>
                            <p className="text-sm text-gray-600">Click on items to add them to your order</p>
                          </div>
                          {selectedItems.length > 0 && (
                            <div className="text-sm text-gray-600">
                              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                            </div>
                          )}
                        </div>
                        <MenuItemSelector
                          categories={activeMenu.categories || []}
                          selectedItems={selectedItems}
                          onItemsChange={setSelectedItems}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-8">
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Order Summary
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Review your order details before creating
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedItems.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Utensils className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Selected</h3>
                        <p className="text-gray-600 mb-6">Add some menu items to see the order summary.</p>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('items')}
                          className="inline-flex items-center gap-2"
                        >
                          <Utensils className="h-4 w-4" />
                          Add Menu Items
                        </Button>
                      </div>
                    ) : (
                      <OrderSummary
                        orderData={{
                          ...form.getValues(),
                          items: selectedItems
                        }}
                        categories={activeMenu?.categories || []}
                        organizationId={organizationId}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
};

export default OrderCreate;
