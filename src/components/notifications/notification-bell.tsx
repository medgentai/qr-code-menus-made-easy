import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Volume2, VolumeX, Check, Trash2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotification, NotificationType, Notification } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/services/order-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationBell: React.FC = () => {

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    enableNotifications,
    setEnableNotifications,
    enableSoundAlerts,
    setEnableSoundAlerts,
    refreshNotifications,
    loading,
    error,
  } = useNotification();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };



  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    return {
      today: notifications.filter(n => {
        const date = new Date(n.timestamp);
        return date >= today;
      }),
      yesterday: notifications.filter(n => {
        const date = new Date(n.timestamp);
        return date >= yesterday && date < today;
      }),
      thisWeek: notifications.filter(n => {
        const date = new Date(n.timestamp);
        return date >= thisWeek && date < yesterday;
      }),
      older: notifications.filter(n => {
        const date = new Date(n.timestamp);
        return date < thisWeek;
      })
    };
  }, [notifications]);

  // Filter notifications based on active tab and filter type
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by read/unread status
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === "read") {
      filtered = filtered.filter(n => n.read);
    }

    // Filter by notification type
    if (filterType !== "all") {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Sort notifications
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [notifications, activeTab, filterType, sortOrder]);

  // Format notification timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60 * 1000) {
      return 'Just now';
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // More than a day
    return date.toLocaleDateString();
  };

  // Get status color for order notifications
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

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_ORDER:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">New</Badge>;
      case NotificationType.ORDER_STATUS_CHANGED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Update</Badge>;
      case NotificationType.ORDER_ITEM_STATUS_CHANGED:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Item</Badge>;
      case NotificationType.SYSTEM_NOTIFICATION:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">System</Badge>;
      case NotificationType.PAYMENT_NOTIFICATION:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Payment</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Info</Badge>;
    }
  };

  // Render a single notification
  const renderNotification = (notification: Notification) => {
    return (
      <div
        key={notification.id}
        className={cn(
          "flex flex-col p-2 rounded-md cursor-pointer hover:bg-accent",
          notification.read ? "opacity-70" : "bg-accent/50"
        )}
        onClick={() => !notification.read && markAsRead(notification.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <span className="text-sm font-medium">
              {notification.title || (
                notification.type === NotificationType.NEW_ORDER ? 'New Order' :
                notification.type === NotificationType.ORDER_STATUS_CHANGED ? 'Status Update' :
                notification.type === NotificationType.ORDER_ITEM_STATUS_CHANGED ? 'Item Update' :
                notification.type === NotificationType.SYSTEM_NOTIFICATION ? 'System Notification' :
                'Payment Notification'
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <p className="text-sm mt-1">{notification.message}</p>
        {notification.type === NotificationType.ORDER_STATUS_CHANGED && notification.data?.status && (
          <div className="mt-1">
            <Badge className={cn("text-xs", getStatusColor(notification.data.status))}>
              {notification.data.status}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh notifications"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              title="Mark all as read"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
              title="Clear all notifications"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center justify-between cursor-default" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center gap-2">
              {enableNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span>Enable notifications</span>
            </div>
            <Switch
              checked={enableNotifications}
              onCheckedChange={(checked) => {
                // Prevent event propagation
                setEnableNotifications(checked);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center justify-between cursor-default" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center gap-2">
              {enableSoundAlerts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Sound alerts</span>
            </div>
            <Switch
              checked={enableSoundAlerts}
              onCheckedChange={(checked) => {
                // Prevent event propagation
                setEnableSoundAlerts(checked);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Filters and sorting */}
        <div className="px-2 py-1 flex items-center justify-between">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs flex items-center" onClick={(e) => e.stopPropagation()}>
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuRadioGroup
                value={filterType}
                onValueChange={(value) => {
                  setFilterType(value);
                }}
              >
                <DropdownMenuRadioItem value="all" onSelect={(e) => e.preventDefault()}>All Types</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={NotificationType.NEW_ORDER} onSelect={(e) => e.preventDefault()}>New Orders</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={NotificationType.ORDER_STATUS_CHANGED} onSelect={(e) => e.preventDefault()}>Status Updates</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={NotificationType.ORDER_ITEM_STATUS_CHANGED} onSelect={(e) => e.preventDefault()}>Item Updates</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={NotificationType.SYSTEM_NOTIFICATION} onSelect={(e) => e.preventDefault()}>System</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={NotificationType.PAYMENT_NOTIFICATION} onSelect={(e) => e.preventDefault()}>Payment</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs flex items-center" onClick={(e) => e.stopPropagation()}>
              Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(value) => {
                  setSortOrder(value);
                }}
              >
                <DropdownMenuRadioItem value="newest" onSelect={(e) => e.preventDefault()}>Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest" onSelect={(e) => e.preventDefault()}>Oldest First</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator />

        {/* Tabs for read/unread */}
        <div onClick={(e) => e.stopPropagation()}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
            }}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1" onClick={(e) => e.stopPropagation()}>All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1" onClick={(e) => e.stopPropagation()}>
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex-1" onClick={(e) => e.stopPropagation()}>Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="py-6 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-500">
            <p>{error}</p>
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>No notifications match your filters</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1 p-1">
              {/* Today's notifications */}
              {groupedNotifications.today.length > 0 && filterType === "all" && activeTab === "all" && (
                <>
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">Today</div>
                  {groupedNotifications.today
                    .filter(n => activeTab === "all" || (activeTab === "unread" && !n.read) || (activeTab === "read" && n.read))
                    .map((notification) => renderNotification(notification))}
                </>
              )}

              {/* Yesterday's notifications */}
              {groupedNotifications.yesterday.length > 0 && filterType === "all" && activeTab === "all" && (
                <>
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">Yesterday</div>
                  {groupedNotifications.yesterday
                    .filter(n => activeTab === "all" || (activeTab === "unread" && !n.read) || (activeTab === "read" && n.read))
                    .map((notification) => renderNotification(notification))}
                </>
              )}

              {/* This week's notifications */}
              {groupedNotifications.thisWeek.length > 0 && filterType === "all" && activeTab === "all" && (
                <>
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">This Week</div>
                  {groupedNotifications.thisWeek
                    .filter(n => activeTab === "all" || (activeTab === "unread" && !n.read) || (activeTab === "read" && n.read))
                    .map((notification) => renderNotification(notification))}
                </>
              )}

              {/* Older notifications */}
              {groupedNotifications.older.length > 0 && filterType === "all" && activeTab === "all" && (
                <>
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">Older</div>
                  {groupedNotifications.older
                    .filter(n => activeTab === "all" || (activeTab === "unread" && !n.read) || (activeTab === "read" && n.read))
                    .map((notification) => renderNotification(notification))}
                </>
              )}

              {/* When filters are applied, show filtered list */}
              {(filterType !== "all" || activeTab !== "all") &&
                filteredNotifications.map((notification) => renderNotification(notification))}
            </div>
          </ScrollArea>
        )}


      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
