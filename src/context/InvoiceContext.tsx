import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Invoice, PaymentInfo, InvoiceStatus, PaymentType, Client } from '../types';
import { generateInvoiceNumber } from '../utils/helpers';
import { searchInvoices as supabaseSearchInvoices } from '../lib/supabase';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  paymentInfo: PaymentInfo;
  updatePaymentInfo: (info: PaymentInfo) => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  duplicateInvoice: (invoice: Invoice) => Promise<void>;
  searchInvoices: (query: string) => Promise<void>;
  clearSearch: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  loadInvoices: (
    page: number, 
    filters?: {
      searchQuery?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: InvoiceStatus | 'All';
      paymentType?: PaymentType | 'All';
    }
  ) => Promise<void>;
}

const defaultPaymentInfo: PaymentInfo = {
  accountName: 'PRIMARKETLUBE LLP',
  accountNumber: '924020005981756',
  ifsc: 'UTIB0002932',
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(defaultPaymentInfo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchResults, setSearchResults] = useState<Invoice[] | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  });

  const loadInvoices = async (
    page: number = 1, 
    filters?: {
      searchQuery?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: InvoiceStatus | 'All';
      paymentType?: PaymentType | 'All';
    }
  ) => {
    try {
      console.log('loadInvoices called with page:', page, 'and filters:', filters);
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      // Use the new searchInvoices function
      const searchQuery = filters?.searchQuery || '';
      const status = filters?.status !== 'All' ? filters?.status : undefined;
      const paymentType = filters?.paymentType !== 'All' ? filters?.paymentType : undefined;
      
      console.log('Calling supabaseSearchInvoices with:', {
        searchQuery,
        page,
        pageSize: pagination.pageSize,
        filters: {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          status,
          paymentType
        }
      });
      
      const result = await supabaseSearchInvoices(
        searchQuery,
        page,
        pagination.pageSize,
        {
          startDate: filters?.startDate || null,
          endDate: filters?.endDate || null, 
          status,
          paymentType
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('Received search results:', {
        dataLength: result.data.length,
        count: result.count,
        totalPages: result.totalPages
      });

      if (result.data.length > 0) {
        console.log('First result:', {
          id: result.data[0].id,
          invoice_number: result.data[0].invoice_number,
          client: result.data[0].clients
        });
      }

      // Transform the data to match our Invoice type
      const transformedInvoices: Invoice[] = result.data.map((invoice: any) => {
        // Handle client data - in the response, the client may be in different formats
        // We need to make sure we can handle all possible cases
        let client: Client = {
          id: '',
          name: '',
          address: '',
          gstin: ''
        };
        
        // If we have a clients property with data
        if (invoice.clients) {
          const clientData = invoice.clients;
          
          // Handle both array and object formats
          if (Array.isArray(clientData) && clientData.length > 0) {
            client = {
              id: clientData[0].id || '',
              name: clientData[0].name || '',
              address: clientData[0].address || '',
              gstin: clientData[0].gstin || ''
            };
          } else if (typeof clientData === 'object') {
            client = {
              id: clientData.id || '',
              name: clientData.name || '',
              address: clientData.address || '',
              gstin: clientData.gstin || ''
            };
          }
        } else if (invoice.client_id) {
          // If we only have client_id but no client data
          client.id = invoice.client_id;
        }
        
        // Process invoice items
        const items = Array.isArray(invoice.invoice_items) 
          ? invoice.invoice_items.map((item: any) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unit_price
            }))
          : [];
        
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          date: new Date(invoice.date),
          dueDate: new Date(invoice.due_date),
          client,
          items,
          status: invoice.status as InvoiceStatus,
          paymentType: invoice.payment_type as PaymentType,
          discountType: invoice.discount_type,
          discountValue: invoice.discount_value,
          taxMode: invoice.tax_mode,
          taxRate: invoice.tax_rate,
          remark: invoice.remark,
          subtotal: invoice.subtotal,
          taxAmount: invoice.tax_amount,
          discountAmount: invoice.discount_amount,
          total: invoice.total,
          paymentInfo: {
            accountName: invoice.payment_info_account_name || paymentInfo.accountName,
            accountNumber: invoice.payment_info_account_number || paymentInfo.accountNumber,
            ifsc: invoice.payment_info_ifsc || paymentInfo.ifsc
          }
        };
      });

      setInvoices(transformedInvoices);
      setPagination(prev => ({
        ...prev,
        currentPage: result.currentPage || 1,
        totalCount: result.count || 0,
        totalPages: result.totalPages || 1
      }));

    } catch (err: any) {
      setError(`Error loading invoices: ${err.message}`);
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchInvoices = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const searchQuery = query.toLowerCase().trim();
      
      if (!searchQuery) {
        setSearchResults(null);
        loadInvoices(1);
        return;
      }

      loadInvoices(1, { searchQuery });
      
    } catch (err: any) {
      setError(`Error searching invoices: ${err.message}`);
      console.error('Error searching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
  };

  const addInvoice = async (invoice: Invoice) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to add an invoice');
        return;
      }

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: invoice.client.name,
          address: invoice.client.address,
          gstin: invoice.client.gstin,
          user_id: session.user.id
        }])
        .select()
        .single();

      if (clientError) {
        setError(`Error creating client: ${clientError.message}`);
        return;
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoice.invoiceNumber,
          date: invoice.date,
          due_date: invoice.dueDate,
          client_id: clientData.id,
          status: invoice.status,
          payment_type: invoice.paymentType,
          discount_type: invoice.discountType,
          discount_value: invoice.discountValue,
          tax_mode: invoice.taxMode,
          tax_rate: invoice.taxRate,
          remark: invoice.remark,
          subtotal: invoice.subtotal,
          tax_amount: invoice.taxAmount,
          discount_amount: invoice.discountAmount,
          total: invoice.total,
          user_id: session.user.id,
          payment_info_account_name: paymentInfo.accountName,
          payment_info_account_number: paymentInfo.accountNumber,
          payment_info_ifsc: paymentInfo.ifsc
        }])
        .select()
        .single();

      if (invoiceError) {
        setError(`Error creating invoice: ${invoiceError.message}`);
        return;
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          invoice.items.map(item => ({
            invoice_id: invoiceData.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice
          }))
        );

      if (itemsError) {
        setError(`Error creating invoice items: ${itemsError.message}`);
        return;
      }

      await loadInvoices(pagination.currentPage);
    } catch (err: any) {
      setError(`Error adding invoice: ${err.message}`);
      console.error('Error adding invoice:', err);
    }
  };

  const updateInvoice = async (id: string, invoice: Invoice) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to update the invoice');
        return;
      }

      const { error: clientError } = await supabase
        .from('clients')
        .update({
          name: invoice.client.name,
          address: invoice.client.address,
          gstin: invoice.client.gstin
        })
        .eq('id', invoice.client.id);

      if (clientError) {
        setError(`Error updating client: ${clientError.message}`);
        return;
      }

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: invoice.invoiceNumber,
          date: invoice.date,
          due_date: invoice.dueDate,
          client_id: invoice.client.id,
          status: invoice.status,
          payment_type: invoice.paymentType,
          discount_type: invoice.discountType,
          discount_value: invoice.discountValue,
          tax_mode: invoice.taxMode,
          tax_rate: invoice.taxRate,
          remark: invoice.remark,
          subtotal: invoice.subtotal,
          tax_amount: invoice.taxAmount,
          discount_amount: invoice.discountAmount,
          total: invoice.total,
          payment_info_account_name: paymentInfo.accountName,
          payment_info_account_number: paymentInfo.accountNumber,
          payment_info_ifsc: paymentInfo.ifsc
        })
        .eq('id', id);

      if (invoiceError) {
        setError(`Error updating invoice: ${invoiceError.message}`);
        return;
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .upsert(
          invoice.items.map(item => ({
            id: item.id,
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice
          }))
        );

      if (itemsError) {
        setError(`Error updating invoice items: ${itemsError.message}`);
        return;
      }

      await loadInvoices(pagination.currentPage);
    } catch (err: any) {
      setError(`Error updating invoice: ${err.message}`);
      console.error('Error updating invoice:', err);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to delete the invoice');
        return;
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (itemsError) {
        setError(`Error deleting invoice items: ${itemsError.message}`);
        return;
      }

      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (invoiceError) {
        setError(`Error deleting invoice: ${invoiceError.message}`);
        return;
      }

      await loadInvoices(pagination.currentPage);
    } catch (err: any) {
      setError(`Error deleting invoice: ${err.message}`);
      console.error('Error deleting invoice:', err);
    }
  };

  const getInvoice = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };

  const updatePaymentInfo = (info: PaymentInfo) => {
    setPaymentInfo(info);
  };

  const duplicateInvoice = async (invoice: Invoice) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to duplicate the invoice');
        return;
      }

      // Generate a new unique invoice number
      let newInvoiceNumber = await generateInvoiceNumber();
      let isUnique = false;
      let attempts = 0;
      
      // Make up to 3 attempts to generate a unique invoice number
      while (!isUnique && attempts < 3) {
        try {
          // Check if the new invoice number is unique
          const { data, error } = await supabase
            .from('invoices')
            .select('id')
            .eq('invoice_number', newInvoiceNumber)
            .eq('user_id', session.user.id);
            
          if (error) {
            throw error;
          }
          
          isUnique = !data || data.length === 0;
          if (!isUnique) {
            // If not unique, generate a new one
            newInvoiceNumber = await generateInvoiceNumber();
          }
        } catch (err) {
          console.error("Error checking invoice number uniqueness:", err);
          break;
        }
        
        attempts++;
      }

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: invoice.client.name,
          address: invoice.client.address,
          gstin: invoice.client.gstin,
          user_id: session.user.id
        }])
        .select()
        .single();

      if (clientError) {
        setError(`Error creating client: ${clientError.message}`);
        return;
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: newInvoiceNumber,
          date: invoice.date,
          due_date: invoice.dueDate,
          client_id: clientData.id,
          status: invoice.status,
          payment_type: invoice.paymentType,
          discount_type: invoice.discountType,
          discount_value: invoice.discountValue,
          tax_mode: invoice.taxMode,
          tax_rate: invoice.taxRate,
          remark: invoice.remark,
          subtotal: invoice.subtotal,
          tax_amount: invoice.taxAmount,
          discount_amount: invoice.discountAmount,
          total: invoice.total,
          user_id: session.user.id,
          payment_info_account_name: paymentInfo.accountName,
          payment_info_account_number: paymentInfo.accountNumber,
          payment_info_ifsc: paymentInfo.ifsc
        }])
        .select()
        .single();

      if (invoiceError) {
        setError(`Error creating invoice: ${invoiceError.message}`);
        return;
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          invoice.items.map(item => ({
            invoice_id: invoiceData.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice
          }))
        );

      if (itemsError) {
        setError(`Error creating invoice items: ${itemsError.message}`);
        return;
      }

      await loadInvoices(pagination.currentPage);
    } catch (err: any) {
      setError(`Error duplicating invoice: ${err.message}`);
      console.error('Error duplicating invoice:', err);
    }
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      getInvoice,
      paymentInfo,
      updatePaymentInfo,
      loading,
      error,
      isAuthenticated,
      duplicateInvoice,
      searchInvoices,
      clearSearch,
      pagination,
      loadInvoices
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};