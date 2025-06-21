import React, { useState } from 'react';
import { Search, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { publicOrderService } from '@/services/public-order-service';
import { OrderStatus } from '@/services/order-service';

interface TrackOrderProps {
  onBackToMenu: () => void;
}

// Mobile Header Component for Track Order
interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  rightAction,
  subtitle
}) => (
  <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="h-9 w-9 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction && (
        <div className="flex items-center">
          {rightAction}
        </div>
      )}
    </div>
  </div>
);

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
      case OrderStatus.SERVED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
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

  const handleRefresh = () => {
    if (orderDetails) {
      if (activeTab === 'orderNumber' && orderNumber) {
        handleTrackByOrderNumber();
      } else if (activeTab === 'phoneNumber' && phoneNumber) {
        handleTrackByPhoneNumber();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Mobile Header */}
      <MobileHeader
        title="Track Your Order"
        subtitle="Check your order status"
        showBackButton={true}
        onBackClick={onBackToMenu}
        rightAction={
          orderDetails ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          ) : null
        }
      />

      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Search Form */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="orderNumber" className="rounded-full">Order Number</TabsTrigger>
              <TabsTrigger value="phoneNumber" className="rounded-full">Phone Number</TabsTrigger>
            </TabsList>
            <TabsContent value="orderNumber" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label htmlFor="orderNumber" className="text-sm font-medium">Order Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderNumber"
                    placeholder="Enter your order number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                  <Button onClick={handleTrackByOrderNumber} disabled={isLoading} className="rounded-full px-6">
                    <Search className="mr-2 h-4 w-4" />
                    Track
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="phoneNumber" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                  <Button onClick={handleTrackByPhoneNumber} disabled={isLoading} className="rounded-full px-6">
                    <Search className="mr-2 h-4 w-4" />
                    Track
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Order Details */}
        {orderDetails && !isLoading && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-xs text-gray-500">Order Number</div>
                  <div className="font-semibold text-lg">{orderDetails.id.substring(0, 8).toUpperCase()}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderDetails.status)}`}>
                  {orderDetails.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Ordered: {new Date(orderDetails.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="text-gray-900">{item.menuItem.name}</span>
                      </div>
                      <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(orderDetails.totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
