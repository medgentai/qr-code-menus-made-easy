import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import webSocketService from '@/services/websocket-service';
import { toast } from 'sonner';

// Table interface
export interface Table {
  id: string;
  number: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  capacity: number;
  currentGuests: number;
  reservationTime?: string;
  orderId?: string;
  orderStatus?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED';
  lastUpdated?: string;
}

// Table event interface
export interface TableEvent {
  tableId: string;
  status: Table['status'];
  currentGuests?: number;
  orderId?: string;
  orderStatus?: string;
  timestamp: Date;
  message: string;
}

// Real-time table management hook
export const useRealTimeTables = (initialTables: Table[] = []) => {
  const { state: { user, accessToken } } = useAuth();
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Track if we've set up listeners to prevent duplicates
  const listenersSetup = useRef(false);

  // Handle table status update events
  const handleTableUpdate = useCallback((event: TableEvent) => {
    console.log('Table updated:', event);
    
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === event.tableId) {
          return {
            ...table,
            status: event.status,
            currentGuests: event.currentGuests ?? table.currentGuests,
            orderId: event.orderId ?? table.orderId,
            orderStatus: event.orderStatus as any ?? table.orderStatus,
            lastUpdated: event.timestamp.toString(),
          };
        }
        return table;
      });
    });
    
    // Show notification for table changes
    toast.info(event.message, {
      duration: 3000,
    });
    
    setLastUpdate(new Date());
  }, []);

  // Handle order-table association events
  const handleOrderTableUpdate = useCallback((event: any) => {
    console.log('Order-table association updated:', event);
    
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === event.tableId) {
          return {
            ...table,
            orderId: event.orderId,
            orderStatus: event.orderStatus,
            status: event.orderId ? 'OCCUPIED' : 'AVAILABLE',
            lastUpdated: event.timestamp.toString(),
          };
        }
        return table;
      });
    });
    
    setLastUpdate(new Date());
  }, []);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (!user || !accessToken || !currentOrganization || listenersSetup.current) {
      return;
    }

    // Connect to WebSocket
    webSocketService.connect(accessToken);
    
    // Join organization room for real-time updates
    webSocketService.joinRoom('organization', currentOrganization.id, accessToken);
    
    // Join venue room if we have a current venue
    if (currentVenue) {
      webSocketService.joinRoom('venue', currentVenue.id, accessToken);
    }

    // Set up event listeners
    webSocketService.on('tableUpdated', handleTableUpdate);
    webSocketService.on('orderTableUpdated', handleOrderTableUpdate);
    
    // Track connection status
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };
    
    const connectionInterval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check
    
    listenersSetup.current = true;

    return () => {
      clearInterval(connectionInterval);
      webSocketService.off('tableUpdated', handleTableUpdate);
      webSocketService.off('orderTableUpdated', handleOrderTableUpdate);
      listenersSetup.current = false;
    };
  }, [user, accessToken, currentOrganization, currentVenue, handleTableUpdate, handleOrderTableUpdate]);

  // Update tables when initial tables change
  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  // Function to update table status
  const updateTableStatus = useCallback(async (tableId: string, newStatus: Table['status'], guestCount?: number) => {
    try {
      // Optimistically update the UI
      setTables(prevTables => {
        return prevTables.map(table => {
          if (table.id === tableId) {
            return {
              ...table,
              status: newStatus,
              currentGuests: guestCount ?? table.currentGuests,
              lastUpdated: new Date().toISOString(),
            };
          }
          return table;
        });
      });

      // The actual API call would be made here
      // The WebSocket will handle the real-time update to other clients
      console.log(`Updating table ${tableId} to status ${newStatus}`);
      
    } catch (error) {
      console.error('Failed to update table status:', error);
      toast.error('Failed to update table status');
    }
  }, []);

  // Function to seat guests at a table
  const seatGuests = useCallback(async (tableId: string, guestCount: number) => {
    return updateTableStatus(tableId, 'OCCUPIED', guestCount);
  }, [updateTableStatus]);

  // Function to clear a table
  const clearTable = useCallback(async (tableId: string) => {
    return updateTableStatus(tableId, 'AVAILABLE', 0);
  }, [updateTableStatus]);

  // Function to mark table for cleaning
  const markForCleaning = useCallback(async (tableId: string) => {
    return updateTableStatus(tableId, 'CLEANING');
  }, [updateTableStatus]);

  // Function to reserve a table
  const reserveTable = useCallback(async (tableId: string, reservationTime: string) => {
    try {
      // Optimistically update the UI
      setTables(prevTables => {
        return prevTables.map(table => {
          if (table.id === tableId) {
            return {
              ...table,
              status: 'RESERVED',
              reservationTime,
              lastUpdated: new Date().toISOString(),
            };
          }
          return table;
        });
      });

      console.log(`Reserving table ${tableId} for ${reservationTime}`);
      
    } catch (error) {
      console.error('Failed to reserve table:', error);
      toast.error('Failed to reserve table');
    }
  }, []);

  // Function to get table statistics
  const getTableStats = useCallback(() => {
    const stats = {
      total: tables.length,
      available: tables.filter(table => table.status === 'AVAILABLE').length,
      occupied: tables.filter(table => table.status === 'OCCUPIED').length,
      reserved: tables.filter(table => table.status === 'RESERVED').length,
      cleaning: tables.filter(table => table.status === 'CLEANING').length,
      totalGuests: tables.reduce((sum, table) => sum + table.currentGuests, 0),
      occupancyRate: tables.length > 0 ? 
        Math.round((tables.filter(table => table.status === 'OCCUPIED').length / tables.length) * 100) : 0,
    };
    
    return stats;
  }, [tables]);

  // Function to get tables by status
  const getTablesByStatus = useCallback((status: Table['status']) => {
    return tables.filter(table => table.status === status);
  }, [tables]);

  // Function to get tables with orders
  const getTablesWithOrders = useCallback(() => {
    return tables.filter(table => table.orderId);
  }, [tables]);

  return {
    tables,
    isConnected,
    lastUpdate,
    updateTableStatus,
    seatGuests,
    clearTable,
    markForCleaning,
    reserveTable,
    getTableStats,
    getTablesByStatus,
    getTablesWithOrders,
    // Utility getters
    availableTables: getTablesByStatus('AVAILABLE'),
    occupiedTables: getTablesByStatus('OCCUPIED'),
    reservedTables: getTablesByStatus('RESERVED'),
    cleaningTables: getTablesByStatus('CLEANING'),
    tablesWithOrders: getTablesWithOrders(),
    stats: getTableStats(),
  };
};

export default useRealTimeTables;
