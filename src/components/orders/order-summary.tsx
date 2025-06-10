import React, { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus } from '@/services/order-service';
import { Category, MenuItem } from '@/services/menu-service';

interface OrderSummaryProps {
  orderData: Partial<CreateOrderDto>;
  categories: Category[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderData, categories }) => {
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

  // Calculate tax and total with memoization
  const tax = useMemo(() => subtotal * 0.08, [subtotal]); // Assuming 8% tax
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

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
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between font-medium mt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between mt-auto">
        <div className="text-sm">
          <span className="font-medium">Status: </span>
          <span>{orderData.status || OrderStatus.PENDING}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
