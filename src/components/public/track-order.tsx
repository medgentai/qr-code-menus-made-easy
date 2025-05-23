import React, { useState } from 'react';
import { Search, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { formatPrice } from '@/lib/utils';
import { publicOrderService } from '@/services/public-order-service';
import { OrderStatus } from '@/services/order-service';

interface TrackOrderProps {
  onBackToMenu: () => void;
}

const TrackOrder: React.FC<TrackOrderProps> = ({ onBackToMenu }) => {
  const [activeTab, setActiveTab] = useState<string>('orderNumber');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get status color
  const getStatusColor = (status: OrderStatus) => {
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

  const handleTrackByOrderNumber = async () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const order = await publicOrderService.getOrderStatus(orderNumber);
      setOrderDetails(order);
    } catch (error) {
      setError('Order not found. Please check your order number and try again.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackByPhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orders = await publicOrderService.getOrdersByPhone(phoneNumber);
      if (orders && orders.length > 0) {
        // Sort by most recent first
        const sortedOrders = orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrderDetails(sortedOrders[0]); // Show the most recent order
      } else {
        setError('No orders found with this phone number.');
        setOrderDetails(null);
      }
    } catch (error) {
      setError('No orders found. Please check your phone number and try again.');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
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
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
          <CardDescription>
            Enter your order number or phone number to check your order status
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orderNumber">Order Number</TabsTrigger>
              <TabsTrigger value="phoneNumber">Phone Number</TabsTrigger>
            </TabsList>
            <TabsContent value="orderNumber" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderNumber"
                    placeholder="Enter your order number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                  <Button onClick={handleTrackByOrderNumber} disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Track
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="phoneNumber" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Button onClick={handleTrackByPhoneNumber} disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Track
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isLoading && (
            <div className="text-center py-8">
              <p>Loading order details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mt-4">
              {error}
            </div>
          )}

          {orderDetails && !isLoading && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Order Number</div>
                    <div className="font-medium">{orderDetails.id.substring(0, 8).toUpperCase()}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                    {orderDetails.status}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ordered: {new Date(orderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Order Summary</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <div className="flex gap-2">
                          <span>{item.quantity}x</span>
                          <span>{item.menuItem.name}</span>
                        </div>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(orderDetails.totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto">
          <Button variant="outline" className="w-full" onClick={onBackToMenu}>
            Return to Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrackOrder;
