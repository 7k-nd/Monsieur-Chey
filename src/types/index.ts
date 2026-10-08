export type TicketCategory = 'standard' | 'vip';

export type PaymentStatus = 'pending' | 'validated' | 'rejected' | 'cash_on_arrival';

export type PaymentMethod = 'mpesa' | 'airtel' | 'orange' | 'cash' | 'bank';

export interface Attendee {
  id: string;
  qrToken: string;
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  photoUrl?: string;
  category: TicketCategory;
  price: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  tableNumber?: string;
  scannedAt?: string;
  isScanned: boolean;
  notes?: string;
  createdAt: string;
  sponsorName?: string;
}

export interface TicketConfig {
  id: TicketCategory;
  name: string;
  price: number;
  badge: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  seatsTotal: number;
  seatsRemaining: number;
}

export interface ScanResult {
  status: 'valid' | 'already_scanned' | 'unpaid' | 'not_found' | 'error';
  message: string;
  attendee?: Attendee;
  scannedAt?: string;
}
