import { api } from '@/lib/api';

export interface QrCode {
  id: string;
  venueId: string;
  menuId: string;
  tableId: string | null;
  name: string;
  description: string | null;
  qrCodeUrl: string;
  qrCodeData: string;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
  venue?: {
    id: string;
    name: string;
  };
  menu?: {
    id: string;
    name: string;
  };
  table?: {
    id: string;
    name: string;
  };
  scans?: QrCodeScan[];
}

export interface QrCodeScan {
  id: string;
  qrCodeId: string;
  ipAddress: string | null;
  userAgent: string | null;
  scannedAt: string;
}

export interface CreateQrCodeData {
  venueId: string;
  menuId: string;
  tableId?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateQrCodeData {
  menuId?: string;
  tableId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const qrCodeService = {
  // Create a new QR code
  async createQrCode(data: CreateQrCodeData): Promise<QrCode> {
    const response = await api.post<QrCode>('/qr-codes', data);
    return response.data;
  },

  // Get all QR codes for a venue
  async getQrCodesForVenue(venueId: string): Promise<QrCode[]> {
    const response = await api.get<QrCode[]>(`/qr-codes/venue/${venueId}`);
    return response.data;
  },

  // Get a QR code by ID
  async getQrCode(id: string): Promise<QrCode> {
    const response = await api.get<QrCode>(`/qr-codes/${id}`);
    return response.data;
  },

  // Update a QR code
  async updateQrCode(id: string, data: UpdateQrCodeData): Promise<QrCode> {
    const response = await api.patch<QrCode>(`/qr-codes/${id}`, data);
    return response.data;
  },

  // Delete a QR code
  async deleteQrCode(id: string): Promise<void> {
    await api.delete(`/qr-codes/${id}`);
  },
};
