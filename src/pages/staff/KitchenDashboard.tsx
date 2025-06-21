import React, { useState } from 'react';
import { useVenue } from '@/contexts/venue-context';
import { useKitchenOrders } from '@/hooks/useRealTimeOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Timer,
  Utensils,
  TrendingUp,
  Users
} from 'lucide-react';
import { Permission } from '@/types/permissions';
import { PermissionGate } from '@/contexts/permission-context';

const KitchenDashboard: React.FC = () => {
  const { currentVenue } = useVenue();

  // Use real-time kitchen orders
  const {
    isConnected,
    lastUpdate,
    isLoading,
    startPreparing,
    markReady,
    confirmedOrders,
    preparingOrders,
    readyOrders,
    stats
  } = useKitchenOrders();

  const [selectedTab, setSelectedTab] = useState('confirmed');

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'PREPARING':
        return <Badge variant="default"><Timer className="h-3 w-3 mr-1" />Preparing</Badge>;
      case 'READY':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };



  return (
    <div className="space-y-4">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Kitchen Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {currentVenue ? `${currentVenue.name} Kitchen` : 'Kitchen Operations'}
            </p>
          </div>
        </div>

        {/* Status Badges - Mobile Responsive */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm">
            <Users className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Kitchen </span>Staff
          </Badge>
          {currentVenue && (
            <Badge variant="secondary" className="text-xs sm:text-sm">
              <span className="truncate max-w-[100px] sm:max-w-none">{currentVenue.name}</span>
            </Badge>
          )}
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs sm:text-sm">
            {isConnected ? "🟢 Live" : "🔴 Offline"}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground hidden md:inline">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Kitchen Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Confirmed</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Ready to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">In Progress</CardTitle>
            <Timer className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.preparing}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Currently </span>Cooking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Ready</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Awaiting </span>Pickup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Avg. Time</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">18m</div>
            <p className="text-xs text-muted-foreground">
              Last 10 orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Orders - Mobile Responsive */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
            Kitchen Orders
          </CardTitle>
          <CardDescription className="text-sm">
            Manage confirmed orders and update preparation status
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="confirmed" className="text-xs sm:text-sm px-2 py-2">
                <span className="hidden sm:inline">Confirmed </span>
                <span className="sm:hidden">Conf. </span>
                ({confirmedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs sm:text-sm px-2 py-2">
                <span className="hidden sm:inline">Preparing </span>
                <span className="sm:hidden">Prep. </span>
                ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-xs sm:text-sm px-2 py-2">
                Ready ({readyOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="confirmed" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : confirmedOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No confirmed orders ready to prepare
                </div>
              ) : (
                confirmedOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm sm:text-base">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground text-sm truncate">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • Ready to prepare
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                              <span className="font-medium">{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-xs text-muted-foreground italic ml-2">
                                  Note: {item.notes}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Loading order items...
                          </div>
                        )}
                      </div>

                      <PermissionGate permission={Permission.MANAGE_ORDER_STATUS}>
                        <Button
                          onClick={() => startPreparing(order.id)}
                          className="w-full text-sm"
                        >
                          <Timer className="h-4 w-4 mr-2" />
                          Start Preparing
                        </Button>
                      </PermissionGate>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="preparing" className="space-y-3 sm:space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : preparingOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders in preparation
                </div>
              ) : (
                preparingOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm sm:text-base">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground text-sm truncate">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • In preparation
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                              <span className="font-medium">{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-xs text-muted-foreground italic ml-2">
                                  Note: {item.notes}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Loading order items...
                          </div>
                        )}
                      </div>

                      <PermissionGate permission={Permission.MARK_ORDER_READY}>
                        <Button
                          onClick={() => markReady(order.id)}
                          className="w-full text-sm bg-green-600 hover:bg-green-700"
                          variant="default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Ready
                        </Button>
                      </PermissionGate>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-3 sm:space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : readyOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders ready for pickup
                </div>
              ) : (
                readyOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-green-500 bg-green-50/30">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm sm:text-base">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground text-sm truncate">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • Ready for pickup
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(order.status)}
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                            🔔 READY
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                              <span className="font-medium">{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-xs text-muted-foreground italic ml-2">
                                  Note: {item.notes}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Loading order items...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenDashboard;
