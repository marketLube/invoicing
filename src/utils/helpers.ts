import { format, parse } from 'date-fns';
import { Invoice, LineItem } from '../types';

export const formatCurrency = (amount: number): string => {
  // Use Arial for the Rupee symbol
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(amount);
  
  return `₹${formattedAmount}`;
};

export const calculateItemTotal = (item: LineItem): number => {
  return item.quantity * item.unitPrice;
};

export const calculateSubtotal = (items: LineItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateDiscountAmount = (
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  }
  return discountValue;
};

export const calculateTaxAmount = (
  subtotal: number,
  discountAmount: number,
  taxMode: 'IGST' | 'CGST-SGST' | 'No GST',
  taxRate: number
): number => {
  if (taxMode === 'No GST') {
    return 0;
  }
  
  const taxableAmount = subtotal - discountAmount;
  return (taxableAmount * taxRate) / 100;
};

export const calculateTotal = (
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number => {
  return subtotal - discountAmount + taxAmount;
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

export const generateInvoiceNumber = (): string => {
  const prefix = 'INV';
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${date}${random}`;
};

export const getSummaryData = (invoices: Invoice[], startDate: Date, endDate: Date) => {
  const filteredInvoices = invoices.filter(
    inv => inv.date >= startDate && inv.date <= endDate
  );
  
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const invoiceCount = filteredInvoices.length;
  const averageInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
  const taxCollected = filteredInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  
  return {
    totalRevenue,
    invoiceCount,
    averageInvoice,
    taxCollected,
  };
};