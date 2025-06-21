import { Order } from '@/services/order-service';

export interface OrderGroup {
  key: string;
  tableInfo: {
    tableName?: string;
    customerName?: string;
    customerPhone?: string;
  };
  orders: Order[];
  hasMultipleOrders: boolean;
  latestOrderTime: string;
  totalAmount: number;
  activeOrdersCount: number;
}

/**
 * Groups orders by table and customer for better visual organization
 * Returns both grouped and individual orders for flexible display
 */
export function groupOrdersForDisplay(orders: Order[]): {
  groups: OrderGroup[];
  shouldShowGrouped: boolean;
} {
  const groupMap = new Map<string, OrderGroup>();

  orders.forEach(order => {
    // Create grouping key based on table and customer
    let groupKey: string;
    let tableInfo: OrderGroup['tableInfo'];

    if (order.tableId && order.customerPhone) {
      // Group by table + customer (most specific)
      groupKey = `table-${order.tableId}-customer-${order.customerPhone}`;
      tableInfo = {
        tableName: order.table?.name,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      };
    } else if (order.tableId) {
      // Group by table only
      groupKey = `table-${order.tableId}`;
      tableInfo = {
        tableName: order.table?.name,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      };
    } else if (order.customerPhone) {
      // Group by customer only (takeout/delivery)
      groupKey = `customer-${order.customerPhone}`;
      tableInfo = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      };
    } else {
      // Individual order (walk-in, no table, no phone)
      groupKey = `individual-${order.id}`;
      tableInfo = {
        customerName: order.customerName,
      };
    }

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        key: groupKey,
        tableInfo,
        orders: [],
        hasMultipleOrders: false,
        latestOrderTime: order.createdAt,
        totalAmount: 0,
        activeOrdersCount: 0,
      });
    }

    const group = groupMap.get(groupKey)!;
    group.orders.push(order);
    group.totalAmount += Number(order.totalAmount);
    
    // Update latest order time
    if (new Date(order.createdAt) > new Date(group.latestOrderTime)) {
      group.latestOrderTime = order.createdAt;
    }
    
    // Count active orders
    if (['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) {
      group.activeOrdersCount++;
    }
  });

  // Mark groups with multiple orders and sort orders within groups
  const groups = Array.from(groupMap.values()).map(group => ({
    ...group,
    hasMultipleOrders: group.orders.length > 1,
    orders: group.orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }));

  // Sort groups by latest order time (most recent first)
  groups.sort((a, b) => 
    new Date(b.latestOrderTime).getTime() - new Date(a.latestOrderTime).getTime()
  );

  // Determine if grouping is beneficial
  const shouldShowGrouped = groups.some(group => group.hasMultipleOrders);

  return {
    groups,
    shouldShowGrouped,
  };
}

/**
 * Gets a display name for an order group
 */
export function getGroupDisplayName(group: OrderGroup): string {
  if (group.tableInfo.tableName && group.tableInfo.customerName) {
    return `${group.tableInfo.tableName} - ${group.tableInfo.customerName}`;
  }
  if (group.tableInfo.tableName) {
    return group.tableInfo.tableName;
  }
  if (group.tableInfo.customerName) {
    return group.tableInfo.customerName;
  }
  if (group.tableInfo.customerPhone) {
    return group.tableInfo.customerPhone;
  }
  return 'Walk-in Order';
}

/**
 * Gets summary text for an order group
 */
export function getGroupSummary(group: OrderGroup): string {
  if (group.orders.length === 1) {
    return '1 order';
  }
  
  if (group.activeOrdersCount > 0) {
    return `${group.orders.length} orders (${group.activeOrdersCount} active)`;
  }
  
  return `${group.orders.length} orders`;
}
