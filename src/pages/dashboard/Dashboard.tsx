import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { MemberRole, StaffType } from '@/types/organization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  BarChart,
  LineChart,
  PieChart,
  QrCode,
  Users,
  Utensils,
  Clock,
  DollarSign,
  Plus,
  Settings,
  GripVertical,
  X,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useActiveOrdersCount, useRecentActiveOrders } from '@/hooks/useActiveOrders';
import { LoadingState, WidgetLoader } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';

// Define widget types
type WidgetType = 'qr-analytics' | 'recent-orders' | 'menu-performance' | 'customer-insights' | 'revenue' | 'peak-hours';

// Define widget data structure
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  expanded?: boolean;
}

// Sample data for widgets
const initialWidgets: Widget[] = [
  { id: '1', type: 'qr-analytics', title: 'QR Code Analytics', size: 'medium', position: 0 },
  { id: '2', type: 'recent-orders', title: 'Recent Orders', size: 'medium', position: 1 },
  { id: '3', type: 'menu-performance', title: 'Menu Performance', size: 'large', position: 2 },
  { id: '4', type: 'customer-insights', title: 'Customer Insights', size: 'small', position: 3 },
  { id: '5', type: 'revenue', title: 'Revenue Overview', size: 'medium', position: 4 },
  { id: '6', type: 'peak-hours', title: 'Peak Hours', size: 'small', position: 5 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  const { userRole, userStaffType } = usePermissions();
  const { currentOrganization, organizations } = useOrganization();
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real dashboard analytics data (today only)
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useDashboardAnalytics(currentOrganization?.id, undefined, 1);

  // Fetch active orders count
  const {
    data: activeOrdersCount,
    isLoading: activeOrdersLoading,
    refetch: refetchActiveOrders
  } = useActiveOrdersCount(currentOrganization?.id);

  // Fetch recent active orders
  const {
    data: recentActiveOrders,
    isLoading: recentActiveOrdersLoading,
    refetch: refetchRecentActiveOrders
  } = useRecentActiveOrders(currentOrganization?.id);

  // Refresh all analytics data
  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchActiveOrders(),
        refetchRecentActiveOrders()
      ]);
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh analytics data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Redirect staff to their appropriate dashboards/pages
  useEffect(() => {
    // Only redirect if we have all the necessary data and user has organizations
    if (userRole === MemberRole.STAFF && userStaffType && organizations && organizations.length > 0) {
      setIsRedirecting(true);
      switch (userStaffType) {
        case StaffType.FRONT_OF_HOUSE:
          // Front of House staff go to orders page (requires organization context)
          if (currentOrganization) {
            navigate(`/organizations/${currentOrganization.id}/orders`, { replace: true });
          }
          break;
        case StaffType.KITCHEN:
          // Kitchen staff go to kitchen dashboard (no organization context needed)
          navigate('/kitchen-dashboard', { replace: true });
          break;
        default:
          // Unknown staff type, stay on general dashboard
          setIsRedirecting(false);
          break;
      }
    }
  }, [userRole, userStaffType, currentOrganization, organizations, navigate]);

  // Handle widget removal
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
    toast.success('Widget removed');
  };

  // Handle widget expansion
  const toggleWidgetExpansion = (id: string) => {
    setWidgets(widgets.map(widget =>
      widget.id === id ? { ...widget, expanded: !widget.expanded } : widget
    ));
  };

  // Handle widget size change
  const changeWidgetSize = (id: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(widgets.map(widget =>
      widget.id === id ? { ...widget, size: newSize } : widget
    ));
    toast.success(`Widget size changed to ${newSize}`);
  };

  // Handle widget drag start
  const handleDragStart = (id: string) => {
    setDraggingWidget(id);
  };

  // Handle widget drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle widget drop
  const handleDrop = (targetId: string) => {
    if (!draggingWidget || draggingWidget === targetId) {
      setDraggingWidget(null);
      return;
    }

    const draggedWidgetIndex = widgets.findIndex(w => w.id === draggingWidget);
    const targetWidgetIndex = widgets.findIndex(w => w.id === targetId);

    if (draggedWidgetIndex === -1 || targetWidgetIndex === -1) {
      setDraggingWidget(null);
      return;
    }

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedWidgetIndex, 1);
    newWidgets.splice(targetWidgetIndex, 0, draggedWidget);

    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index
    }));

    setWidgets(updatedWidgets);
    setDraggingWidget(null);
    toast.success('Dashboard layout updated');
  };

  // Add a new widget
  const addWidget = (type: WidgetType) => {
    // Check if widget type already exists
    const existingWidget = widgets.find(widget => widget.type === type);
    if (existingWidget) {
      toast.error('This widget is already added to the dashboard');
      return;
    }

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: 'medium',
      position: widgets.length,
    };

    setWidgets([...widgets, newWidget]);
    toast.success('New widget added');
  };

  // Check if a widget type is already added
  const isWidgetAdded = (type: WidgetType): boolean => {
    return widgets.some(widget => widget.type === type);
  };

  // Check if all available widgets are added
  const allWidgetTypes: WidgetType[] = ['qr-analytics', 'recent-orders', 'menu-performance', 'customer-insights', 'revenue', 'peak-hours'];
  const allWidgetsAdded = allWidgetTypes.every(type => isWidgetAdded(type));

  // Get widget title based on type
  const getWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case 'qr-analytics': return 'QR Code Analytics';
      case 'recent-orders': return 'Recent Orders';
      case 'menu-performance': return 'Menu Performance';
      case 'customer-insights': return 'Customer Insights';
      case 'revenue': return 'Revenue Overview';
      case 'peak-hours': return 'Peak Hours';
      default: return 'New Widget';
    }
  };

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'qr-analytics':
        const qrData = analyticsData?.qrAnalytics;
        return (
          <div className="space-y-4">
            {analyticsLoading ? (
              <LoadingState height="150px" message="Loading QR analytics..." />
            ) : analyticsError ? (
              <ErrorDisplay
                type="general"
                title="Unable to load QR analytics"
                height="150px"
                onRetry={refetchAnalytics}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{qrData?.totalScans || 0}</div>
                    <div className="text-sm text-muted-foreground">Total scans today</div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Unique Scans</div>
                      <div className="text-lg font-semibold">{qrData?.uniqueScans || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Total Scans</div>
                      <div className="text-lg font-semibold">{qrData?.totalScans || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="h-[100px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-xs">Real-time QR scan tracking</p>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'recent-orders':
        const completedTodayCount = analyticsData?.recentOrders?.length || 0; // Completed orders from analytics
        const currentActiveOrdersCount = activeOrdersCount || 0; // Real active orders count

        return (
          <div className="space-y-4">
            {recentActiveOrdersLoading ? (
              <LoadingState height="150px" message="Loading recent orders..." />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active Orders: {currentActiveOrdersCount}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Completed Today: {completedTodayCount}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {recentActiveOrders && recentActiveOrders.length > 0 ? (
                    recentActiveOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-1.5 rounded border text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">#{order.id.substring(0, 8)}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {order.customerName || 'Anonymous'} • {order.status}
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-medium text-sm">₹{Number(order.totalAmount).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{order.items?.length || 0} items</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-3">
                      <Clock className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">No active orders</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 'menu-performance':
        const topItems = analyticsData?.topItems || [];
        const maxOrders = topItems.length > 0 ? Math.max(...topItems.map(item => item.orders)) : 1;

        return (
          <div className="space-y-4">
            {analyticsLoading ? (
              <LoadingState height="200px" message="Loading menu performance..." />
            ) : analyticsError ? (
              <ErrorDisplay
                type="general"
                title="Unable to load menu performance"
                height="200px"
                onRetry={refetchAnalytics}
              />
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">Today's Top Items</div>
                <div className="space-y-4">
                  {topItems.length > 0 ? (
                    topItems.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm font-medium">{item.orders} orders</div>
                        </div>
                        <Progress value={(item.orders / maxOrders) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Revenue: ₹{item.revenue.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <Utensils className="h-8 w-8 mx-auto mb-2" />
                      <p>No menu items data available</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 'customer-insights':
        const customerStats = analyticsData?.customerStats;
        const returningPercentage = customerStats?.totalToday > 0
          ? Math.round((customerStats.returning / customerStats.totalToday) * 100)
          : 0;

        return (
          <div className="space-y-4">
            {analyticsLoading ? (
              <LoadingState height="150px" message="Loading customer insights..." />
            ) : analyticsError ? (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>Unable to load customer insights</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">New Customers</div>
                    <div className="text-2xl font-bold">{customerStats?.new || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Returning</div>
                    <div className="text-2xl font-bold">{customerStats?.returning || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${returningPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {returningPercentage}%
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Avg. Spend</div>
                  <div className="text-xl font-bold">₹{(customerStats?.averageSpend || 0).toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        );

      case 'revenue':
        const revenueData = analyticsData?.revenue;

        return (
          <div className="space-y-4">
            {analyticsLoading ? (
              <LoadingState height="150px" message="Loading revenue data..." />
            ) : analyticsError ? (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2" />
                  <p>Unable to load revenue data</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Today's Revenue</div>
                    <div className="text-2xl font-bold">₹{(revenueData?.today || 0).toFixed(2)}</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Revenue Breakdown</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Orders</div>
                        <div className="text-lg font-semibold">{analyticsData?.recentOrders?.length || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Avg. Order</div>
                        <div className="text-lg font-semibold">
                          ₹{analyticsData?.recentOrders?.length > 0
                            ? ((revenueData?.today || 0) / analyticsData.recentOrders.length).toFixed(2)
                            : '0.00'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[100px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-xs">Real-time revenue tracking</p>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'peak-hours':
        const peakHours = analyticsData?.peakHours || [];
        const maxPeakOrders = peakHours.length > 0 ? Math.max(...peakHours.map(peak => peak.orders)) : 1;

        return (
          <div className="space-y-4">
            {analyticsLoading ? (
              <LoadingState height="150px" message="Loading peak hours..." />
            ) : analyticsError ? (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                <div className="text-center">
                  <BarChart className="h-8 w-8 mx-auto mb-2" />
                  <p>Unable to load peak hours</p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">Today's Busiest Hours</div>
                <div className="space-y-2">
                  {peakHours.length > 0 ? (
                    peakHours
                      .sort((a, b) => b.orders - a.orders)
                      .slice(0, 3)
                      .map((peak, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-12 text-sm">{peak.hour}</div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.max((peak.orders / maxPeakOrders) * 100, 5)}%` }}
                            ></div>
                          </div>
                          <div className="text-sm font-medium">{peak.orders}</div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <BarChart className="h-8 w-8 mx-auto mb-2" />
                      <p>No peak hours data available</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      default:
        return <div>Widget content not available</div>;
    }
  };  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your workspace...</p>
        </div>
      </div>
    );
  }

  // Show loading state for staff users while redirecting
  if (userRole === MemberRole.STAFF && (isRedirecting || !currentOrganization)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your workspace...</p>
        </div>
      </div>
    );
  }

  // Show message when no organization is selected
  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">No organization selected</p>
            <p>Please select an organization to view the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your business today.
            </p>
            {analyticsData?.lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(analyticsData.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={refreshAnalytics}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={allWidgetsAdded}
                  className={allWidgetsAdded ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {allWidgetsAdded ? 'All Widgets Added' : 'Add Widget'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => addWidget('qr-analytics')}
                  disabled={isWidgetAdded('qr-analytics')}
                  className={isWidgetAdded('qr-analytics') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code Analytics
                  {isWidgetAdded('qr-analytics') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => addWidget('recent-orders')}
                  disabled={isWidgetAdded('recent-orders')}
                  className={isWidgetAdded('recent-orders') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Orders
                  {isWidgetAdded('recent-orders') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => addWidget('menu-performance')}
                  disabled={isWidgetAdded('menu-performance')}
                  className={isWidgetAdded('menu-performance') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Menu Performance
                  {isWidgetAdded('menu-performance') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => addWidget('customer-insights')}
                  disabled={isWidgetAdded('customer-insights')}
                  className={isWidgetAdded('customer-insights') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customer Insights
                  {isWidgetAdded('customer-insights') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => addWidget('revenue')}
                  disabled={isWidgetAdded('revenue')}
                  className={isWidgetAdded('revenue') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Revenue Overview
                  {isWidgetAdded('revenue') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => addWidget('peak-hours')}
                  disabled={isWidgetAdded('peak-hours')}
                  className={isWidgetAdded('peak-hours') ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Peak Hours
                  {isWidgetAdded('peak-hours') && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets
            .sort((a, b) => a.position - b.position)
            .map(widget => (
              <Card
                key={widget.id}
                className={`${
                  widget.size === 'small' ? 'col-span-1' :
                  widget.size === 'medium' ? 'col-span-1 md:col-span-1' :
                  'col-span-1 md:col-span-2 lg:col-span-3'
                } ${
                  widget.expanded ? 'col-span-1 md:col-span-2 lg:col-span-3 h-[500px]' : ''
                } ${
                  draggingWidget === widget.id ? 'border-primary' : ''
                }`}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(widget.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleWidgetExpansion(widget.id)}
                    >
                      {widget.expanded ?
                        <Minimize2 className="h-4 w-4" /> :
                        <Maximize2 className="h-4 w-4" />
                      }
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, 'small')}>
                          Small Size
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, 'medium')}>
                          Medium Size
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, 'large')}>
                          Large Size
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className={widget.expanded ? 'h-[420px]' : 'h-auto'}>
                    {renderWidgetContent(widget)}
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
  );
};

export default Dashboard;
