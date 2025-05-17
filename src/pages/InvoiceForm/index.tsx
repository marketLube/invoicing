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
import { generateInvoiceNumber, calculateSubtotal, calculateDiscountAmount, calculateTaxAmount, calculateTotal } from '../../utils/helpers';
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
    invoiceNumber: generateInvoiceNumber(),
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
  };
  
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode) {
      const existingInvoice = getInvoice(id!);
      if (existingInvoice) {
        setInvoice(existingInvoice);
      } else {
        navigate('/');
      }
    }
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
  
  useEffect(() => {
    calculateAmounts();
  }, [
    invoice.items, 
    invoice.discountType, 
    invoice.discountValue, 
    invoice.taxMode, 
    invoice.taxRate
  ]);
  
  const handleInvoiceMetaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (field: 'date' | 'dueDate', date: Date) => {
    setInvoice(prev => ({ ...prev, [field]: date }));
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
  
  const handleSave = () => {
    if (isEditMode) {
      updateInvoice(invoice.id, invoice);
    } else {
      addInvoice({ ...invoice, id: Date.now().toString() });
    }
    navigate('/');
  };
  
  const handleReset = () => {
    if (isEditMode) {
      const existingInvoice = getInvoice(id!);
      if (existingInvoice) {
        setInvoice(existingInvoice);
      }
    } else {
      setInvoice(initialInvoice);
    }
  };

  const handleDownloadPDF = async () => {
    try {
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
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DiscountTaxSection
            discountType={invoice.discountType}
            discountValue={invoice.discountValue}
            taxMode={invoice.taxMode}
            taxRate={invoice.taxRate}
            onChange={handleDiscountTaxChange}
          />
          
          <Summary
            subtotal={invoice.subtotal}
            discountAmount={invoice.discountAmount}
            taxAmount={invoice.taxAmount}
            total={invoice.total}
            taxMode={invoice.taxMode}
          />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-2 px-3 sm:py-3 sm:px-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            className="btn btn-sm btn-outline flex items-center gap-1.5 min-w-[84px] justify-center text-xs sm:text-sm"
            onClick={() => navigate('/')}
          >
            <Home size={14} />
            <span>Home</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-outline flex items-center gap-1.5 min-w-[72px] justify-center text-xs sm:text-sm"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            
            <button
              className="btn btn-sm btn-primary flex items-center gap-1.5 min-w-[72px] justify-center text-xs sm:text-sm"
              onClick={handleSave}
            >
              <Save size={14} />
              <span>Save</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn btn-sm btn-primary flex items-center gap-1.5 min-w-[84px] justify-center text-xs sm:text-sm"
            >
              <Download size={14} />
              <span>{isGeneratingPDF ? 'Loading...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;