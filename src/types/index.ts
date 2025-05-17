export interface Client {
  id: string;
  name: string;
  address: string;
  gstin?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentType = 'Advance' | 'Full Payment';
export type InvoiceStatus = 'Paid' | 'Unpaid';

export interface PaymentInfo {
  accountName: string;
  accountNumber: string;
  ifsc: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  client: Client;
  items: LineItem[];
  status: InvoiceStatus;
  paymentType: PaymentType;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxMode: 'IGST' | 'CGST-SGST' | 'No GST';
  taxRate: number;
  remark?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentInfo: PaymentInfo;
}