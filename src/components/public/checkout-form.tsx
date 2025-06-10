import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ShoppingBag, User, CreditCard } from 'lucide-react';
import { CreatePublicOrderDto } from '@/services/public-order-service';
import PartySizeInput from '@/components/orders/PartySizeInput';

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
  onBack: () => void;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  venueId,
  tableId,
  tableCapacity,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const {
    items,
    totalItems,
    subtotal,
    gstAmount,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    roomNumber,
    partySize,
  } = useCart();

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

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
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
                            parseFloat(item.menuItem.discountPrice || item.menuItem.price) +
                            (item.modifiers?.reduce((total, mod) => total + parseFloat(mod.price), 0) || 0)
                          ) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* GST Breakdown */}
            <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-600">Subtotal</span>
                  <span className="text-xs font-semibold text-orange-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-500">CGST (2.5%)</span>
                  <span className="text-xs text-orange-700">{formatPrice(gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-500">SGST (2.5%)</span>
                  <span className="text-xs text-orange-700">{formatPrice(gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-orange-300">
                  <span className="text-sm font-bold text-orange-900">Total (incl. GST)</span>
                  <span className="text-sm font-bold text-orange-900">{formatPrice(totalAmount)}</span>
                </div>
              </div>
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
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-sky-700">Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Confirm Order • {formatPrice(totalAmount)}</span>
                      </div>
                    )}
                  </Button>

                  <p className="text-center text-xs text-sky-600 mt-2">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
