import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Minimize2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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

// Sample data for charts and metrics
const sampleData = {
  qrScans: [120, 145, 132, 165, 178, 156, 199],
  recentOrders: [
    { id: 'ORD-1234', customer: 'John D.', items: 3, total: 42.50, time: '10 mins ago', status: 'completed' },
    { id: 'ORD-1235', customer: 'Sarah M.', items: 2, total: 28.75, time: '15 mins ago', status: 'completed' },
    { id: 'ORD-1236', customer: 'Robert K.', items: 5, total: 67.20, time: '25 mins ago', status: 'completed' },
    { id: 'ORD-1237', customer: 'Emily T.', items: 1, total: 12.99, time: '30 mins ago', status: 'completed' },
    { id: 'ORD-1238', customer: 'Michael P.', items: 4, total: 53.45, time: '45 mins ago', status: 'completed' },
  ],
  topItems: [
    { name: 'Margherita Pizza', orders: 145, revenue: 1740 },
    { name: 'Chicken Burger', orders: 132, revenue: 1584 },
    { name: 'Caesar Salad', orders: 98, revenue: 882 },
    { name: 'Chocolate Cake', orders: 87, revenue: 783 },
  ],
  customerStats: {
    new: 24,
    returning: 68,
    totalToday: 92,
    averageSpend: 34.75,
  },
  revenue: {
    today: 1245.50,
    yesterday: 1087.25,
    thisWeek: 8765.30,
    lastWeek: 7654.20,
    growth: 14.5,
  },
  peakHours: [
    { hour: '11:00', orders: 15 },
    { hour: '12:00', orders: 42 },
    { hour: '13:00', orders: 38 },
    { hour: '18:00', orders: 27 },
    { hour: '19:00', orders: 53 },
    { hour: '20:00', orders: 45 },
  ],
};

const Dashboard = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [activeTab, setActiveTab] = useState('overview');
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);

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
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{sampleData.qrScans.reduce((a, b) => a + b, 0)}</div>
                <div className="text-sm text-muted-foreground">Total scans this week</div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="h-[100px] flex items-end gap-2">
              {sampleData.qrScans.map((scan, i) => (
                <div
                  key={i}
                  className="bg-primary/80 rounded-t w-full"
                  style={{ height: `${(scan / 200) * 100}%` }}
                  title={`Day ${i+1}: ${scan} scans`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
          </div>
        );

      case 'recent-orders':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active Orders: 3
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Completed Today: 42
              </Badge>
            </div>
            <div className="space-y-2">
              {sampleData.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer} • {order.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{order.items} items</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'menu-performance':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Tabs defaultValue="top-items" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="top-items">Top Items</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="top-items" className="space-y-4 pt-4">
                  {sampleData.topItems.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm font-medium">{item.orders} orders</div>
                      </div>
                      <Progress value={(item.orders / 150) * 100} className="h-2" />
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="categories" className="pt-4">
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-8 w-8 mx-auto mb-2" />
                      <p>Category performance chart will appear here</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      case 'customer-insights':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">New Customers</div>
                <div className="text-2xl font-bold">{sampleData.customerStats.new}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Returning</div>
                <div className="text-2xl font-bold">{sampleData.customerStats.returning}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(sampleData.customerStats.returning / sampleData.customerStats.totalToday) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round((sampleData.customerStats.returning / sampleData.customerStats.totalToday) * 100)}%
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">Avg. Spend</div>
              <div className="text-xl font-bold">${sampleData.customerStats.averageSpend.toFixed(2)}</div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Today's Revenue</div>
                <div className="text-2xl font-bold">${sampleData.revenue.today.toFixed(2)}</div>
              </div>
              <Badge variant={sampleData.revenue.today > sampleData.revenue.yesterday ? "success" : "destructive"}>
                {sampleData.revenue.today > sampleData.revenue.yesterday ? "↑" : "↓"}
                {Math.abs(((sampleData.revenue.today - sampleData.revenue.yesterday) / sampleData.revenue.yesterday) * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="text-lg font-bold">${sampleData.revenue.thisWeek.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Week</div>
                <div className="text-lg font-bold">${sampleData.revenue.lastWeek.toFixed(2)}</div>
              </div>
            </div>
            <div className="h-[100px] flex items-center justify-center">
              <LineChart className="h-20 w-20 text-muted-foreground" />
            </div>
          </div>
        );

      case 'peak-hours':
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Today's Busiest Hours</div>
            <div className="space-y-2">
              {sampleData.peakHours.sort((a, b) => b.orders - a.orders).slice(0, 3).map((peak, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{peak.hour}</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(peak.orders / 60) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium">{peak.orders}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Widget content not available</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addWidget('qr-analytics')}>
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget('recent-orders')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget('menu-performance')}>
                  <Utensils className="mr-2 h-4 w-4" />
                  Menu Performance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget('customer-insights')}>
                  <Users className="mr-2 h-4 w-4" />
                  Customer Insights
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget('revenue')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Revenue Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget('peak-hours')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Peak Hours
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>

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
    </DashboardLayout>
  );
};

export default Dashboard;
