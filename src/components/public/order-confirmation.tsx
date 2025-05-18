import React from 'react';
import { CheckCircle, ArrowLeft, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/services/order-service';

interface OrderConfirmationProps {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  items: {
    name: string;
    quantity: number;
    price: string;
    notes?: string;
  }[];
  totalAmount: number;
  customerName: string;
  estimatedTime?: string;
  onBackToMenu: () => void;
  onTrackOrder?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  orderNumber,
  status,
  items,
  totalAmount,
  customerName,
  estimatedTime = '15-20 minutes',
  onBackToMenu,
  onTrackOrder,
}) => {
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.READY:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderStatus.DELIVERED:
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={onBackToMenu}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      <Card className="w-full flex flex-col min-h-[280px]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your order, {customerName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-sm text-muted-foreground">Order Number</div>
                <div className="font-medium">{orderNumber}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {status}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estimated time: {estimatedTime}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div className="flex gap-2">
                    <span>{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span>{formatPrice(parseFloat(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700">Order Status Updates</h4>
              <p className="text-sm text-blue-600 mt-1">
                You can check back here for updates on your order status. The staff will update your order as it progresses.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-auto">
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 w-full">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700">Save Your Order Number</h4>
              <p className="text-sm text-blue-600 mt-1">
                Your order number is <span className="font-bold">{orderNumber}</span>. Save it to track your order status later.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {onTrackOrder && (
              <Button variant="outline" onClick={onTrackOrder}>
                <Clock className="mr-2 h-4 w-4" />
                Track Your Order
              </Button>
            )}
            <Button className={onTrackOrder ? "" : "w-full"} onClick={onBackToMenu}>
              Return to Menu
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
