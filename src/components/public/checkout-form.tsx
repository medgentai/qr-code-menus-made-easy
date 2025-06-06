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
import { ArrowLeft, ShoppingBag } from 'lucide-react';
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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Order Summary */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="bg-accent/20 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </h2>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-background rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-sm">x{item.quantity}</div>
                    </div>
                    {item.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                    <div className="text-right font-medium mt-2">
                      {formatPrice((
                        parseFloat(item.menuItem.price) +
                        (item.modifiers?.reduce((total, mod) => total + parseFloat(mod.price), 0) || 0)
                      ) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="w-full md:w-1/2">
          <div className="bg-accent/20 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
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
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} />
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
                        <PartySizeInput
                          value={field.value}
                          onChange={field.onChange}
                          tableCapacity={tableCapacity}
                          label="Party Size"
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
                        <FormLabel>Room Number (for hotel guests)</FormLabel>
                        <FormControl>
                          <Input placeholder="Room number" {...field} />
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
                      <FormLabel>Additional Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or instructions"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
