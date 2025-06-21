import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, ShoppingBag, User, CreditCard, Search, AlertTriangle, CheckCircle, Phone } from 'lucide-react';
import { CreateOrderItemModifierDto } from '@/services/order-service';
import PartySizeInput from '@/components/orders/PartySizeInput';
import { useQuery } from '@tanstack/react-query';
import { TaxService } from '@/services/tax-service';
import { ServiceType } from '@/types/tax';
import { publicOrderService, CustomerSearchResponse } from '@/services/public-order-service';
import { toast } from 'sonner';

// Extended modifier interface that includes name and price for display
interface CartItemModifier extends CreateOrderItemModifierDto {
  name: string;
  price: string;
}

// Form schema
const formSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  customerPhone: z.string().min(5, 'Phone number is required'),
  roomNumber: z.string().optional(),
  partySize: z.union([
    z.number().min(1, 'Party size must be at least 1'),
    z.undefined()
  ]).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  venueId: string;
  tableId: string | null;
  tableCapacity?: number | null;
  organizationId: string;
  onBack: () => void;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  tableId,
  tableCapacity,
  organizationId,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const {
    items,
    totalItems,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    roomNumber,
    partySize,
  } = useCart();

  // Customer search state
  const [phoneSearchValue, setPhoneSearchValue] = useState(customerPhone || '');
  const [isSearching, setIsSearching] = useState(false);
  const [customerSearchResult, setCustomerSearchResult] = useState<CustomerSearchResponse | null>(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debug logging
  console.log('Checkout form props:', { organizationId, tableId });
  console.log('Cart items:', items);

  // Convert cart items to tax calculation format
  const taxItems = useMemo(() => {
    return items.map(item => {
      const modifiersPrice = item.modifiers?.reduce((total, mod) => {
        const modPrice = (mod as any).price ? parseFloat((mod as any).price) : 0;
        return total + modPrice;
      }, 0) || 0;

      const taxItem: any = {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.menuItem.discountPrice || item.menuItem.price),
      };

      // Only include modifiersPrice if it's greater than 0
      if (modifiersPrice > 0) {
        taxItem.modifiersPrice = modifiersPrice;
      }

      return taxItem;
    });
  }, [items]);

  // Calculate tax for the order
  const {
    data: taxCalculation,
    isLoading: isCalculatingTax,
  } = useQuery({
    queryKey: ['checkout-tax-calculation', organizationId, taxItems],
    queryFn: () => {
      console.log('Tax calculation request:', {
        organizationId,
        serviceType: ServiceType.DINE_IN,
        items: taxItems,
      });
      return TaxService.calculateTax({
        organizationId,
        serviceType: ServiceType.DINE_IN, // Default to dine in for checkout
        items: taxItems,
      });
    },
    enabled: items.length > 0 && !!organizationId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: customerName || '',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      roomNumber: roomNumber || '',
      partySize: partySize || undefined,
      notes: '',
    },
  });

  // Handle phone number search
  const handlePhoneSearch = async () => {
    if (!phoneSearchValue.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    try {
      const result = await publicOrderService.searchCustomerByPhone(phoneSearchValue, tableId);
      setCustomerSearchResult(result);
      setHasSearched(true);

      if (result.found && result.customer) {
        setShowCustomerProfile(true);
        // Don't auto-fill the form yet, let user choose to use profile
      } else {
        setShowCustomerProfile(false);
        // Update form with phone number
        form.setValue('customerPhone', phoneSearchValue);
      }

      // Store customer phone for table change detection
      localStorage.setItem('customerPhone', phoneSearchValue);

      // Show appropriate messages for active orders
      if (result.activeOrders.length > 0) {
        if (result.canOrder) {
          // Customer can order (same table)
          toast.success(result.restrictionMessage || 'You can continue adding items to your order.');
        } else {
          // Customer cannot order (different table)
          toast.error(result.restrictionMessage || 'You cannot place new orders until your current orders are completed and paid.');
        }
      }
    } catch (error) {
      toast.error('Failed to search customer. Please try again.');
      setCustomerSearchResult(null);
      setShowCustomerProfile(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle using customer profile
  const handleUseProfile = () => {
    if (customerSearchResult?.customer) {
      form.setValue('customerName', customerSearchResult.customer.name);
      form.setValue('customerEmail', customerSearchResult.customer.email);
      form.setValue('customerPhone', customerSearchResult.customer.phone);
      setShowCustomerProfile(false);
      toast.success('Profile loaded successfully');
    }
  };

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Check if customer can order (if we have search results)
    if (customerSearchResult && !customerSearchResult.canOrder) {
      toast.error(customerSearchResult.restrictionMessage || 'You cannot place orders at this time.');
      return;
    }

    // Ensure phone number is set from search
    const submitValues = {
      ...values,
      customerPhone: phoneSearchValue || values.customerPhone
    };

    onSubmit(submitValues);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg h-8 px-2"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              <span className="text-sm">Back</span>
            </Button>
            <h1 className="text-base font-semibold text-gray-900">Checkout</h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 py-4 space-y-4">
        {/* Compact Order Summary */}
        <div className="bg-white rounded-lg shadow-lg border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Order Summary</h2>
                  <p className="text-orange-100 text-xs">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{formatPrice(totalAmount)}</p>
                <p className="text-orange-100 text-xs">Total</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Compact Items List */}
            <div className="space-y-0 border border-orange-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className={`${index !== items.length - 1 ? 'border-b border-orange-100' : ''}`}>
                  <div className="px-3 py-2.5 hover:bg-orange-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-white">{item.quantity}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.menuItem.name}</h4>
                            {item.notes && (
                              <p className="text-xs text-orange-600 mt-1 italic">{item.notes}</p>
                            )}
                            <div className="mt-1 text-xs text-orange-600">
                              {formatPrice(parseFloat(item.menuItem.discountPrice || item.menuItem.price))} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-gray-900 text-sm">
                          {formatPrice((
                            parseFloat(item.menuItem.discountPrice || item.menuItem.price) +                            (item.modifiers?.reduce((total, mod) => {
                              // Cast mod to CartItemModifier type to access price property
                              const modPrice = (mod as CartItemModifier).price ? parseFloat((mod as CartItemModifier).price) : 0;
                              return total + modPrice;
                            }, 0) || 0)
                          ) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax Breakdown */}
            <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
              {taxCalculation ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-orange-700">Subtotal:</span>
                    <span className="text-xs text-orange-700">{formatPrice(taxCalculation.subtotalAmount)}</span>
                  </div>

                  {!taxCalculation.taxBreakdown.isTaxExempt && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-orange-700">
                        Tax ({taxCalculation.taxBreakdown.taxRate}%):
                      </span>
                      <span className="text-xs text-orange-700">{formatPrice(taxCalculation.taxBreakdown.taxAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-orange-200">
                    <span className="text-sm font-bold text-orange-900">Total</span>
                    <span className="text-sm font-bold text-orange-900">{formatPrice(taxCalculation.totalAmount)}</span>
                  </div>

                  {taxCalculation.displayMessage && (
                    <div className="text-xs text-orange-600 text-center">
                      * {taxCalculation.displayMessage}
                    </div>
                  )}
                </div>
              ) : isCalculatingTax ? (
                <div className="flex justify-center items-center py-2">
                  <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-xs text-orange-700">Calculating tax...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-orange-900">Total</span>
                    <span className="text-sm font-bold text-orange-900">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="text-xs text-orange-600 text-center">
                    Tax will be calculated at checkout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Contact Form */}
        <div className="bg-white rounded-lg shadow-lg border border-sky-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Contact Details</h2>
                <p className="text-sky-100 text-xs">Required for confirmation</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Phone Number Search Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span className="text-xs font-semibold text-sky-700">Phone Number *</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your phone number"
                      value={phoneSearchValue}
                      onChange={(e) => setPhoneSearchValue(e.target.value)}
                      className="h-9 rounded-lg border-sky-200 focus:border-sky-500 focus:ring-sky-200 bg-sky-50/30 text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePhoneSearch();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePhoneSearch}
                      disabled={isSearching || !phoneSearchValue.trim()}
                      className="h-9 px-3 border-sky-200 hover:bg-sky-50 hover:border-sky-300"
                    >
                      {isSearching ? (
                        <div className="w-4 h-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 text-sky-600" />
                      )}
                    </Button>
                  </div>

                  {/* Customer Profile Display */}
                  {showCustomerProfile && customerSearchResult?.customer && (
                    <Card className="p-3 bg-green-50 border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-green-900">{customerSearchResult.customer.name}</h4>
                            <p className="text-xs text-green-700">{customerSearchResult.customer.email}</p>
                            <p className="text-xs text-green-600">{customerSearchResult.customer.phone}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUseProfile}
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                        >
                          Use Profile
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Active Orders Information */}
                  {customerSearchResult?.activeOrders && customerSearchResult.activeOrders.length > 0 && (
                    <Alert className={`${customerSearchResult.canOrder ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      {customerSearchResult.canOrder ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={`text-xs ${customerSearchResult.canOrder ? 'text-green-800' : 'text-red-800'}`}>
                        {customerSearchResult.restrictionMessage}
                        <div className="mt-2 space-y-1">
                          {customerSearchResult.activeOrders.map((order) => (
                            <div key={order.orderId} className="text-xs">
                              <strong>{order.tableName}</strong> - {order.status} ({order.paymentStatus})
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Show name and email fields only if customer not found after search */}
                {hasSearched && !customerSearchResult?.found && (
                  <>
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-sky-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-9 rounded-lg border-sky-200 focus:border-sky-500 focus:ring-sky-200 bg-sky-50/30 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-sky-700">Email Address (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your email address"
                              type="email"
                              className="h-9 rounded-lg border-sky-200 focus:border-sky-500 focus:ring-sky-200 bg-sky-50/30 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Hidden phone field to store the value */}
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <input type="hidden" {...field} value={phoneSearchValue} />
                  )}
                />

                {/* Show remaining form fields only after customer search is complete */}
                {hasSearched && (
                  <>
                    {/* Party Size - only show for table orders */}
                    {tableId && (
                      <FormField
                        control={form.control}
                        name="partySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-sky-700">Party Size</FormLabel>
                            <PartySizeInput
                              value={field.value}
                              onChange={field.onChange}
                              tableCapacity={tableCapacity}
                              label=""
                              placeholder="Number of guests"
                              showQuickButtons={true}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {!tableId && (
                      <FormField
                        control={form.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-sky-700">Room Number (For Hotel Guests)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your room number"
                                className="h-9 rounded-lg border-sky-200 focus:border-sky-500 focus:ring-sky-200 bg-sky-50/30 text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-sky-700">Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests, dietary requirements, or cooking instructions..."
                              className="min-h-[80px] rounded-lg border-sky-200 focus:border-sky-500 focus:ring-sky-200 resize-none bg-sky-50/30 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 border-t border-sky-100">
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || (customerSearchResult && !customerSearchResult.canOrder)}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : customerSearchResult && !customerSearchResult.canOrder ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Cannot Order - Active Order Exists</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Confirm Order • {formatPrice(taxCalculation?.totalAmount || totalAmount)}</span>
                          </div>
                        )}
                      </Button>

                      <p className="text-center text-xs text-sky-600 mt-2">
                        By placing this order, you agree to our terms and conditions
                      </p>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
