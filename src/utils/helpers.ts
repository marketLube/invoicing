import { format, parse } from 'date-fns';
import { Invoice, LineItem } from '../types';
import { supabase } from '../lib/supabase';

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
  // For percentage discounts, calculate based on subtotal
  if (discountType === 'percentage') {
    // If the subtotal is 0, percentage of 0 is always 0
    if (subtotal <= 0) return 0;
    return (subtotal * discountValue) / 100;
  }
  
  // For fixed discounts, always use the fixed value regardless of subtotal
  // This allows for negative totals when fixed discount > subtotal
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
  
  // Calculate the amount that should be taxed (subtotal minus discount)
  const taxableAmount = subtotal - discountAmount;
  
  // Only apply tax if the taxable amount is positive
  // If discount is greater than subtotal, no tax should be applied
  if (taxableAmount <= 0) {
    return 0;
  }
  
  return (taxableAmount * taxRate) / 100;
};

export const calculateTotal = (
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number => {
  // Calculate net amount after discount
  const netAfterDiscount = subtotal - discountAmount;
  
  // If there's a fixed discount larger than the subtotal, allow negative totals
  // Add tax to the final amount (tax will be 0 if net is negative)
  return netAfterDiscount + taxAmount;
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

// Generate a new invoice number based on the current date and a sequential counter
export const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const prefix = 'INV';
    const currentDate = new Date();
    const yearMonth = format(currentDate, 'yyyyMM');
    
    // Get the current session to check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("User is not authenticated, using fallback invoice number generation");
      // Fallback to random number if not authenticated
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const date = format(currentDate, 'yyyyMMdd');
      return `${prefix}${date}${random}`;
    }
    
    // Get the latest invoice number from this user
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("Error fetching latest invoice numbers:", error);
      // Fallback to random number on error
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const date = format(currentDate, 'yyyyMMdd');
      return `${prefix}${date}${random}`;
    }
    
    // Find the highest sequence number for the current year/month
    let maxSequence = 0;
    const pattern = new RegExp(`${prefix}${yearMonth}(\\d{4})`);
    
    invoices?.forEach(invoice => {
      if (!invoice.invoice_number) return;
      
      const match = invoice.invoice_number.match(pattern);
      if (match && match[1]) {
        const sequence = parseInt(match[1], 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });
    
    // Increment the sequence and pad to 4 digits
    const nextSequence = (maxSequence + 1).toString().padStart(4, '0');
    return `${prefix}${yearMonth}${nextSequence}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Ultimate fallback
    const prefix = 'INV';
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${date}${random}`;
  }
};

// Check if an invoice number already exists
export const isInvoiceNumberUnique = async (invoiceNumber: string, currentInvoiceId?: string): Promise<boolean> => {
  try {
    // Get the current session to check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return true; // Cannot check uniqueness without auth, assume it's unique
    }
    
    let query = supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .eq('user_id', session.user.id);
    
    // Exclude the current invoice ID if provided (for updates)
    if (currentInvoiceId) {
      query = query.neq('id', currentInvoiceId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error checking invoice number uniqueness:", error);
      return false;
    }
    
    // If no data or empty array, the invoice number is unique
    return !data || data.length === 0;
  } catch (error) {
    console.error("Error checking invoice number uniqueness:", error);
    return false;
  }
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