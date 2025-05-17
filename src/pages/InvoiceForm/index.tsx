import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Save, RotateCcw, Home } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import InvoiceHeader from './InvoiceHeader';
import InvoiceType from './InvoiceType';
import ClientInfo from './ClientInfo';
import LineItemsTable from './LineItemsTable';
import DiscountTaxSection from './DiscountTaxSection';
import Summary from './Summary';
import { generateInvoiceNumber, calculateSubtotal, calculateDiscountAmount, calculateTaxAmount, calculateTotal, isInvoiceNumberUnique } from '../../utils/helpers';
import { Invoice, LineItem, Client, PaymentType } from '../../types';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../PDFGenerator/InvoicePDF';

const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, addInvoice, updateInvoice, paymentInfo } = useInvoices();
  
  const emptyLineItem: LineItem = {
    id: Date.now().toString(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  };
  
  const initialInvoice: Invoice = {
    id: '',
    invoiceNumber: '', // Will be set asynchronously
    date: new Date(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    client: {
      id: '',
      name: '',
      address: '',
      gstin: '',
    },
    items: [emptyLineItem],
    status: 'Unpaid',
    paymentType: 'Full Payment',
    discountType: 'percentage',
    discountValue: 0,
    taxMode: 'IGST',
    taxRate: 18,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0,
    paymentInfo: paymentInfo,
  };
  
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [numberError, setNumberError] = useState<string | null>(null);
  const isEditMode = !!id;
  
  useEffect(() => {
    const initializeInvoice = async () => {
      if (isEditMode) {
        const existingInvoice = getInvoice(id!);
        if (existingInvoice) {
          setInvoice(existingInvoice);
        } else {
          navigate('/');
        }
      } else {
        // Generate a new invoice number
        try {
          const newInvoiceNumber = await generateInvoiceNumber();
          setInvoice(prev => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error("Error generating invoice number:", error);
        }
      }
    };

    initializeInvoice();
  }, [id, getInvoice, navigate, isEditMode]);
  
  const calculateAmounts = () => {
    const subtotal = calculateSubtotal(invoice.items);
    const discountAmount = calculateDiscountAmount(
      subtotal,
      invoice.discountType,
      invoice.discountValue
    );
    const taxAmount = calculateTaxAmount(
      subtotal,
      discountAmount,
      invoice.taxMode,
      invoice.taxRate
    );
    const total = calculateTotal(subtotal, discountAmount, taxAmount);
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }));
  };
  
  // Always recalculate amounts when relevant fields change
  useEffect(() => {
    calculateAmounts();
  }, [
    invoice.items, 
    invoice.discountType, 
    invoice.discountValue, 
    invoice.taxMode, 
    invoice.taxRate
  ]);
  
  const handleInvoiceMetaChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'invoiceNumber') {
      // Check if invoice number is unique
      setIsCheckingNumber(true);
      setNumberError(null);
      
      setInvoice(prev => ({ ...prev, [name]: value }));
      
      try {
        const isUnique = await isInvoiceNumberUnique(value, isEditMode ? id : undefined);
        if (!isUnique) {
          setNumberError('This invoice number already exists. Please use a different one.');
        }
      } catch (error) {
        console.error("Error checking invoice number uniqueness:", error);
      } finally {
        setIsCheckingNumber(false);
      }
    } else {
      setInvoice(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDateChange = (field: 'date' | 'dueDate', date: Date) => {
    if (field === 'date') {
      // If invoice date is changed, ensure due date is not before it
      if (invoice.dueDate < date) {
        // If due date is now before invoice date, set due date to invoice date
        setInvoice(prev => ({ 
          ...prev, 
          [field]: date,
          dueDate: date 
        }));
      } else {
        // Just update the invoice date
        setInvoice(prev => ({ ...prev, [field]: date }));
      }
    } else if (field === 'dueDate') {
      // If the due date is being set earlier than invoice date, don't update
      if (date < invoice.date) {
        alert('Due date cannot be earlier than invoice date');
        return;
      }
      setInvoice(prev => ({ ...prev, [field]: date }));
    }
  };
  
  const handlePaymentTypeChange = (type: PaymentType) => {
    setInvoice(prev => ({ ...prev, paymentType: type }));
  };
  
  const handleClientChange = (client: Client) => {
    setInvoice(prev => ({ ...prev, client }));
  };
  
  const handleItemsChange = (items: LineItem[]) => {
    setInvoice(prev => ({ ...prev, items }));
  };
  
  const handleDiscountTaxChange = (
    field: 'discountType' | 'discountValue' | 'taxMode' | 'taxRate',
    value: any
  ) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };
  
  const validateInvoice = async (): Promise<boolean> => {
    // Basic validation
    if (!invoice.invoiceNumber) {
      alert('Please enter an invoice number');
      return false;
    }
    
    if (!invoice.client.name) {
      alert('Please enter a client name');
      return false;
    }
    
    if (invoice.items.length === 0) {
      alert('Please add at least one item');
      return false;
    }
    
    if (invoice.items.some(item => !item.description || item.quantity <= 0)) {
      alert('Please fill in all item details (description and quantity)');
      return false;
    }
    
    // Validate due date is not before invoice date
    if (invoice.dueDate < invoice.date) {
      alert('Due date cannot be earlier than invoice date');
      return false;
    }
    
    // Check invoice number uniqueness
    try {
      const isUnique = await isInvoiceNumberUnique(invoice.invoiceNumber, isEditMode ? id : undefined);
      if (!isUnique) {
        setNumberError('This invoice number already exists. Please use a different one.');
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking invoice number uniqueness:", error);
      alert('Failed to validate invoice number. Please try again.');
      return false;
    }
  };
  
  const handleSave = async () => {
    // Force recalculate amounts before saving
    calculateAmounts();
    
    const isValid = await validateInvoice();
    if (!isValid) return;
    
    if (isEditMode) {
      // Calculate all values in the correct order
      const subtotal = calculateSubtotal(invoice.items);
      const discountAmount = calculateDiscountAmount(
        subtotal,
        invoice.discountType,
        invoice.discountValue
      );
      const taxAmount = calculateTaxAmount(
        subtotal,
        discountAmount,
        invoice.taxMode,
        invoice.taxRate
      );
      const total = calculateTotal(
        subtotal,
        discountAmount,
        taxAmount
      );
      
      // Make sure to use the freshly calculated values
      const updatedInvoice = {
        ...invoice,
        subtotal,
        discountAmount,
        taxAmount,
        total
      };
      
      // Update the invoice with the latest data
      updateInvoice(id!, updatedInvoice);
    } else {
      // For new invoices
      const newInvoice = {
        ...invoice,
        id: Date.now().toString()
      };
      addInvoice(newInvoice);
    }
    
    // Navigate back to the dashboard
    navigate('/');
  };
  
  const handleReset = () => {
    if (isEditMode) {
      const existingInvoice = getInvoice(id!);
      if (existingInvoice) {
        setInvoice(existingInvoice);
      }
    } else {
      setInvoice(prev => ({ ...prev, items: [emptyLineItem] }));
      generateInvoiceNumber().then(newNumber => {
        setInvoice(prev => ({ ...prev, invoiceNumber: newNumber }));
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Validate and save invoice first
      const isValid = await validateInvoice();
      if (!isValid) return;
      
      // Force recalculate amounts before generating PDF
      calculateAmounts();
      
      // If it's a new invoice or has been modified, save it first
      if (!isEditMode) {
        await addInvoice({ ...invoice, id: Date.now().toString() });
      } else {
        // Check if the invoice has been modified
        const originalInvoice = getInvoice(id!);
        if (JSON.stringify(originalInvoice) !== JSON.stringify(invoice)) {
          await updateInvoice(invoice.id, invoice);
        }
      }
      
      // Now generate and download the PDF
      setIsGeneratingPDF(true);
      const blob = await pdf(<InvoicePDF invoice={invoice} paymentInfo={paymentInfo} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Navigate back to dashboard after successful download
      navigate('/');
    } catch (error) {
      console.error('Error handling PDF download:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between mb-6">
        <button
          className="btn btn-outline flex items-center gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn btn-outline flex items-center gap-2"
        >
          <Download size={16} />
          {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow border border-neutral-200">
        <InvoiceHeader
          invoiceNumber={invoice.invoiceNumber}
          date={invoice.date}
          dueDate={invoice.dueDate}
          onInvoiceNumberChange={handleInvoiceMetaChange}
          onDateChange={handleDateChange}
          numberError={numberError}
          isCheckingNumber={isCheckingNumber}
        />
        
        <InvoiceType
          paymentType={invoice.paymentType}
          onChange={handlePaymentTypeChange}
        />
        
        <ClientInfo
          client={invoice.client}
          onChange={handleClientChange}
        />
        
        <LineItemsTable
          items={invoice.items}
          onChange={handleItemsChange}
        />
        
        <div className="mb-4">
          <DiscountTaxSection
            discountType={invoice.discountType}
            discountValue={invoice.discountValue}
            taxMode={invoice.taxMode}
            taxRate={invoice.taxRate}
            onChange={handleDiscountTaxChange}
          />
        </div>
        
        <div className="mt-6">
          <Summary
            subtotal={invoice.subtotal}
            taxMode={invoice.taxMode}
            taxAmount={invoice.taxAmount}
            discountAmount={invoice.discountAmount}
            total={invoice.total}
          />
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={handleSave}
          >
            <Save size={16} />
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;