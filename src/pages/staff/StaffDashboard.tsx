import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  ShoppingCart, 
  Menu, 
  MapPin, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Users,
  Building2,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Permission } from '@/types/permissions';
import { PermissionGate } from '@/contexts/permission-context';

// Mock data for general staff
const mockRecentOrders = [
  {
    id: '1',
    orderNumber: '#001',
    customerName: 'Table 5',
    status: 'PREPARING',
    items: 3,
    total: 45.50,
    orderTime: '11:30 AM',
  },
  {
    id: '2',
    orderNumber: '#002',
    customerName: 'Table 12',
    status: 'READY',
    items: 2,
    total: 28.75,
    orderTime: '11:25 AM',
  },
  {
    id: '3',
    orderNumber: '#003',
    customerName: 'Table 8',
    status: 'COMPLETED',
    items: 4,
    total: 67.25,
    orderTime: '11:15 AM',
  },
];

const mockTodayStats = {
  totalOrders: 24,
  completedOrders: 18,
  pendingOrders: 6,
  totalRevenue: 1245.50,
  averageOrderValue: 51.90,
  busyHours: '12:00 PM - 2:00 PM',
};

const StaffDashboard: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const { userRole, userStaffType, hasPermission, accessLevelDescription } = usePermissions();
  const { currentOrganization } = useOrganization();
  const { currentVenue, venues } = useVenue();
  
  const [recentOrders] = useState(mockRecentOrders);
  const [todayStats] = useState(mockTodayStats);

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'PREPARING':
        return <Badge variant="default"><Clock className="h-3 w-3 mr-1" />Preparing</Badge>;
      case 'READY':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground">
              {currentVenue ? `${currentVenue.name} Operations` : 'General Staff Operations'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <User className="h-3 w-3 mr-1" />
            General Staff
          </Badge>
          {currentVenue && (
            <Badge variant="secondary" className="text-sm">
              {currentVenue.name}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Access Level Info */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-medium">Your Access Level</h3>
              <p className="text-sm text-muted-foreground">{accessLevelDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.completedOrders} completed, {todayStats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Avg. ${todayStats.averageOrderValue} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{todayStats.busyHours}</div>
            <p className="text-xs text-muted-foreground">
              Peak service time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and information you can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PermissionGate permission={Permission.VIEW_ORDERS}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">View Orders</h3>
                      <p className="text-sm text-muted-foreground">Check order status and details</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permission={Permission.VIEW_MENUS}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Menu className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">View Menus</h3>
                      <p className="text-sm text-muted-foreground">Browse menu items and prices</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permission={Permission.VIEW_VENUES}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">View Venues</h3>
                      <p className="text-sm text-muted-foreground">See venue information</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>
                Latest orders you can view
              </CardDescription>
            </div>
            <PermissionGate permission={Permission.VIEW_ORDERS}>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/organizations/${organizationId}/orders`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent orders to display
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.orderNumber}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{order.customerName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items} items • ${order.total} • {order.orderTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Venue Information */}
      {currentVenue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Current Venue
            </CardTitle>
            <CardDescription>
              Information about your assigned venue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">{currentVenue.name}</h3>
                {currentVenue.description && (
                  <p className="text-sm text-muted-foreground">{currentVenue.description}</p>
                )}
              </div>
              
              {currentVenue.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {currentVenue.address}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={currentVenue.isActive ? "default" : "secondary"}>
                  {currentVenue.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {currentVenue.type || 'Restaurant'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffDashboard;
