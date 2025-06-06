import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Table as TableIcon, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Utensils
} from 'lucide-react';

export interface TableWithOccupancy {
  id: string;
  name: string;
  capacity: number | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  currentPartySize?: number;
  orders?: Array<{
    id: string;
    partySize?: number | null;
    status: string;
  }>;
}

interface TableCapacityStatusProps {
  tables: TableWithOccupancy[];
  className?: string;
}

export const TableCapacityStatus: React.FC<TableCapacityStatusProps> = ({ 
  tables, 
  className 
}) => {
  // Calculate occupancy statistics
  const stats = React.useMemo(() => {
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
    const reservedTables = tables.filter(t => t.status === 'RESERVED').length;
    
    const totalCapacity = tables.reduce((sum, table) => sum + (table.capacity || 0), 0);
    const currentOccupancy = tables.reduce((sum, table) => {
      if (table.status === 'OCCUPIED') {
        // Get party size from active orders or current party size
        const activeOrder = table.orders?.find(order => 
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
        );
        return sum + (activeOrder?.partySize || table.currentPartySize || 0);
      }
      return sum;
    }, 0);
    
    const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0;
    
    return {
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      totalCapacity,
      currentOccupancy,
      occupancyRate
    };
  }, [tables]);

  const getTableStatusColor = (table: TableWithOccupancy) => {
    switch (table.status) {
      case 'AVAILABLE':
        return 'bg-green-50 border-green-200';
      case 'OCCUPIED':
        // Check if table is at or over capacity
        const activeOrder = table.orders?.find(order => 
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
        );
        const partySize = activeOrder?.partySize || table.currentPartySize || 0;
        const capacity = table.capacity || 0;
        
        if (capacity > 0 && partySize >= capacity) {
          return 'bg-red-50 border-red-200'; // At or over capacity
        }
        return 'bg-blue-50 border-blue-200'; // Normal occupancy
      case 'RESERVED':
        return 'bg-yellow-50 border-yellow-200';
      case 'MAINTENANCE':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTableStatusBadge = (table: TableWithOccupancy) => {
    const activeOrder = table.orders?.find(order => 
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
    );
    const partySize = activeOrder?.partySize || table.currentPartySize || 0;
    const capacity = table.capacity || 0;

    switch (table.status) {
      case 'AVAILABLE':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Available</Badge>;
      case 'OCCUPIED':
        if (capacity > 0 && partySize >= capacity) {
          return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Full</Badge>;
        }
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Occupied</Badge>;
      case 'RESERVED':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Reserved</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className={className}>
      {/* Overall Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Table Capacity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.availableTables}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.occupiedTables}</div>
              <div className="text-sm text-muted-foreground">Occupied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reservedTables}</div>
              <div className="text-sm text-muted-foreground">Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.currentOccupancy}/{stats.totalCapacity}</div>
              <div className="text-sm text-muted-foreground">Guests</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Occupancy</span>
              <span>{Math.round(stats.occupancyRate)}%</span>
            </div>
            <Progress value={stats.occupancyRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map(table => {
          const activeOrder = table.orders?.find(order => 
            ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
          );
          const partySize = activeOrder?.partySize || table.currentPartySize || 0;
          const capacity = table.capacity || 0;
          const occupancyPercentage = capacity > 0 ? (partySize / capacity) * 100 : 0;

          return (
            <Card key={table.id} className={`${getTableStatusColor(table)} transition-colors`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span className="font-semibold">{table.name}</span>
                  </div>
                  {getTableStatusBadge(table)}
                </div>

                {capacity > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Capacity
                      </span>
                      <span>{partySize}/{capacity}</span>
                    </div>
                    
                    <Progress 
                      value={occupancyPercentage} 
                      className={`h-2 ${occupancyPercentage >= 100 ? 'bg-red-100' : ''}`}
                    />
                    
                    {occupancyPercentage >= 100 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        At capacity
                      </div>
                    )}
                  </div>
                )}

                {table.status === 'OCCUPIED' && activeOrder && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Order #{activeOrder.id.substring(0, 8)} - {activeOrder.status}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TableCapacityStatus;
