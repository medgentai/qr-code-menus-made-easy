// Table status enum
export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  UNAVAILABLE = 'UNAVAILABLE'
}

// Table status labels for display
export const TableStatusLabels: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: 'Available',
  [TableStatus.OCCUPIED]: 'Occupied',
  [TableStatus.RESERVED]: 'Reserved',
  [TableStatus.UNAVAILABLE]: 'Unavailable'
};

// Table status colors for UI
export const TableStatusColors: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: 'bg-green-100 text-green-800 border-green-200',
  [TableStatus.OCCUPIED]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TableStatus.RESERVED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TableStatus.UNAVAILABLE]: 'bg-gray-100 text-gray-800 border-gray-200'
};
