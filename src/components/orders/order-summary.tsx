import React, { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreateOrderDto, OrderStatus, Order } from '@/services/order-service';
import { Category, MenuItem } from '@/services/menu-service';
import { TaxSummary } from './TaxBreakdown';
import { useQuery } from '@tanstack/react-query';
import { TaxService } from '@/services/tax-service';
import { ServiceType } from '@/types/tax';
import { useOrganization } from '@/contexts/organization-context';

interface OrderSummaryProps {
  orderData: Partial<CreateOrderDto>;
  categories: Category[];
  existingOrder?: Order; // For displaying tax breakdown of existing orders
  organizationId?: string; // For tax calculation on new orders
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderData, categories, existingOrder, organizationId }) => {
  const { currentOrganization } = useOrganization();
  // Create a map of menu items for faster lookup
  const menuItemMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    categories.forEach(category => {
      category.items?.forEach(item => {
        map.set(item.id, item);
      });
    });
    return map;
  }, [categories]);

  // Find a menu item by ID (using the map for O(1) lookup)
  const findMenuItem = (menuItemId: string): MenuItem | undefined => {
    return menuItemMap.get(menuItemId);
  };

  // Calculate subtotal with memoization
  const subtotal = useMemo(() => {
    return (orderData.items || []).reduce((total, item) => {
      const menuItem = findMenuItem(item.menuItemId);
      if (menuItem) {
        // Use discounted price if available, otherwise use regular price
        const price = parseFloat(menuItem.discountPrice || menuItem.price);
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  }, [orderData.items, menuItemMap]);

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Get the organization ID for tax calculation
  const taxOrganizationId = organizationId || currentOrganization?.id;

  // Convert order items to tax calculation format
  const taxItems = useMemo(() => {
    if (!orderData.items || orderData.items.length === 0) return [];

    return orderData.items.map(item => {
      const menuItem = findMenuItem(item.menuItemId);
      if (!menuItem) return null;

      const unitPrice = parseFloat(menuItem.discountPrice || menuItem.price);
      const modifiersPrice = item.modifiers?.reduce((total, mod) => {
        // Assuming modifiers have a price property
        const modPrice = (mod as any).price ? parseFloat((mod as any).price) : 0;
        return total + modPrice;
      }, 0) || 0;

      const taxItem: any = {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
      };

      // Only include modifiersPrice if it's greater than 0
      if (modifiersPrice > 0) {
        taxItem.modifiersPrice = modifiersPrice;
      }

      return taxItem;
    }).filter(Boolean);
  }, [orderData.items, menuItemMap]);

  // Calculate tax for new orders
  const {
    data: taxCalculation,
    isLoading: isCalculatingTax,
  } = useQuery({
    queryKey: ['order-summary-tax-calculation', taxOrganizationId, taxItems],
    queryFn: () => TaxService.calculateTax({
      organizationId: taxOrganizationId!,
      serviceType: ServiceType.DINE_IN, // Default to dine in
      items: taxItems,
    }),
    enabled: !existingOrder && !!taxOrganizationId && taxItems.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Note: Total is calculated directly from taxCalculation.totalAmount in the UI

  return (
    <Card className="flex flex-col min-h-[280px]">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {/* Customer Information */}
        {(orderData.customerName || orderData.customerEmail || orderData.customerPhone || orderData.roomNumber) && (
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="text-sm space-y-1">
              {orderData.customerName && <p>Name: {orderData.customerName}</p>}
              {orderData.customerEmail && <p>Email: {orderData.customerEmail}</p>}
              {orderData.customerPhone && <p>Phone: {orderData.customerPhone}</p>}
              {orderData.roomNumber && <p>Room: {orderData.roomNumber}</p>}
            </div>
          </div>
        )}

        {/* Table Information */}
        {orderData.tableId && (
          <div>
            <h3 className="font-medium mb-2">Table Information</h3>
            <p className="text-sm">Table ID: {orderData.tableId}</p>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h3 className="font-medium mb-2">Order Items</h3>
          {(orderData.items || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No items added to the order yet.</p>
          ) : (
            <div className="space-y-2">
              {(orderData.items || []).map((item, index) => {
                const menuItem = findMenuItem(item.menuItemId);
                if (!menuItem) return null;

                // Use discounted price if available, otherwise use regular price
                const itemTotal = parseFloat(menuItem.discountPrice || menuItem.price) * item.quantity;

                return (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      {menuItem.name}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground ml-5">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">{formatPrice(itemTotal)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Notes */}
        {orderData.notes && (
          <div>
            <h3 className="font-medium mb-2">Order Notes</h3>
            <p className="text-sm">{orderData.notes}</p>
          </div>
        )}

        <Separator />

        {/* Order Totals */}
        {existingOrder ? (
          <TaxSummary order={existingOrder} />
        ) : taxCalculation ? (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(taxCalculation.subtotalAmount)}</span>
            </div>

            {!taxCalculation.taxBreakdown.isTaxExempt && (
              <div className="flex justify-between text-sm">
                <span>Tax ({taxCalculation.taxBreakdown.taxRate}%):</span>
                <span>{formatPrice(taxCalculation.taxBreakdown.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Total</span>
              <span>{formatPrice(taxCalculation.totalAmount)}</span>
            </div>

            {taxCalculation.displayMessage && (
              <div className="text-xs text-muted-foreground">
                * {taxCalculation.displayMessage}
              </div>
            )}
          </div>
        ) : isCalculatingTax ? (
          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-center items-center py-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-xs text-muted-foreground">Calculating tax...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              * Tax will be calculated at checkout
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-start items-center mt-auto py-3">
        <div className="text-sm flex items-center">
          <span className="font-medium">Status: </span>
          <span>{orderData.status || OrderStatus.PENDING}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
