import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
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
  AlertCircle, 
  Timer,
  Utensils,
  TrendingUp,
  Users
} from 'lucide-react';
import { Permission } from '@/types/permissions';
import { PermissionGate } from '@/contexts/permission-context';

const KitchenDashboard: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const { userRole, userStaffType, hasPermission } = usePermissions();
  const { currentOrganization } = useOrganization();
  const { currentVenue, venues } = useVenue();

  // Use real-time kitchen orders
  const {
    orders,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
            <p className="text-muted-foreground">
              {currentVenue ? `${currentVenue.name} Kitchen` : 'Kitchen Operations'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            Kitchen Staff
          </Badge>
          {currentVenue && (
            <Badge variant="secondary" className="text-sm">
              {currentVenue.name}
            </Badge>
          )}
          <Badge variant={isConnected ? "default" : "destructive"} className="text-sm">
            {isConnected ? "🟢 Live" : "🔴 Offline"}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Kitchen Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Ready to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preparing}</div>
            <p className="text-xs text-muted-foreground">
              Currently cooking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Serve</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting pickup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Prep Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18m</div>
            <p className="text-xs text-muted-foreground">
              Last 10 orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Kitchen Orders
          </CardTitle>
          <CardDescription>
            Manage confirmed orders and update preparation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="confirmed">
                Confirmed ({confirmedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparing ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready">
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
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • Ready to prepare
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-muted-foreground italic">
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
                          className="w-full"
                        >
                          Start Preparing
                        </Button>
                      </PermissionGate>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="preparing" className="space-y-4 mt-4">
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
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • In preparation
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-muted-foreground italic">
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
                          className="w-full"
                          variant="default"
                        >
                          Mark as Ready
                        </Button>
                      </PermissionGate>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4 mt-4">
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
                  <Card key={order.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">#{order.id.slice(-8)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {order.customerName || order.table?.name || 'Online Order'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ordered at {new Date(order.createdAt).toLocaleTimeString()} • Ready for pickup
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                              {item.notes && (
                                <span className="text-muted-foreground italic">
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
