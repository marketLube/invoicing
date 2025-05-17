import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit, Copy, X, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Invoice, InvoiceStatus } from '../../types';
import { useInvoices } from '../../context/InvoiceContext';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../PDFGenerator/InvoicePDF';

interface InvoiceTableProps {
  invoices: Invoice[];
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  const { updateInvoice, duplicateInvoice } = useInvoices();
  const [editingRemark, setEditingRemark] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      updateInvoice(id, { ...invoice, status });
    }
  };

  const handleRemarkEdit = (id: string, initialRemark: string = '') => {
    setEditingRemark(id);
    setRemarkText(initialRemark);
  };

  const saveRemark = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      updateInvoice(id, { ...invoice, remark: remarkText });
    }
    setEditingRemark(null);
  };

  const handleDuplicate = (invoice: Invoice) => {
    duplicateInvoice(invoice);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id);
      
      // Ensure the invoice is saved with the latest data before downloading
      await updateInvoice(invoice.id, invoice);
      
      // Generate and download the PDF
      const blob = await pdf(<InvoicePDF invoice={invoice} paymentInfo={invoice.paymentInfo} />).toBlob();
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
      setDownloadingId(null);
    }
  };

  // Create empty rows to maintain consistent table height
  const createEmptyRows = () => {
    // Create 5 empty rows when there are no invoices
    const emptyRowCount = invoices.length === 0 ? 5 : 0;
    return Array(emptyRowCount).fill(0).map((_, index) => (
      <tr key={`empty-${index}`} className="table-row h-[54px]">
        <td colSpan={8} className="px-4 py-3 text-center text-neutral-300 border-b border-neutral-200"></td>
      </tr>
    ));
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="table-header">
            <th className="px-4 py-3 text-left w-[80px]">Status</th>
            <th className="px-4 py-3 text-left w-[150px]">Invoice #</th>
            <th className="px-4 py-3 text-left w-[120px]">Date</th>
            <th className="px-4 py-3 text-left w-[150px]">Client</th>
            <th className="px-4 py-3 text-left w-[140px] whitespace-nowrap">Payment Type</th>
            <th className="px-4 py-3 text-right w-[120px]">Total (₹)</th>
            <th className="px-4 py-3 text-left w-[150px]">Remark</th>
            <th className="px-4 py-3 text-center w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <>
              <tr className="table-row">
                <td colSpan={8} className="px-4 py-4 text-center text-neutral-500 border-b border-neutral-200">
                  No invoices found. Create a new invoice to get started.
                </td>
              </tr>
              {createEmptyRows()}
            </>
          ) : (
            invoices.map(invoice => (
              <tr key={invoice.id} className="table-row">
                <td className="px-4 py-3 w-[80px]">
                  <div className="flex items-center">
                    <button
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        invoice.status === 'Paid'
                          ? 'bg-success-main text-white'
                          : 'bg-warning-main text-white'
                      }`}
                      onClick={() => 
                        handleStatusChange(
                          invoice.id, 
                          invoice.status === 'Paid' ? 'Unpaid' : 'Paid'
                        )
                      }
                    >
                      {invoice.status === 'Paid' ? (
                        <Check size={14} />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 w-[150px]">
                  <div className="group relative">
                    <span className="block truncate max-w-[140px] font-medium">
                      {invoice.invoiceNumber && invoice.invoiceNumber.length > 15 
                        ? `${invoice.invoiceNumber.slice(0, 15)}...` 
                        : invoice.invoiceNumber || 'N/A'}
                    </span>
                    {invoice.invoiceNumber && invoice.invoiceNumber.length > 15 && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        {invoice.invoiceNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 w-[120px]">{formatDate(invoice.date)}</td>
                <td className="px-4 py-3 w-[150px]">
                  <div className="group relative">
                    <span className="block truncate max-w-[140px]">
                      {invoice.client && invoice.client.name 
                        ? `${invoice.client.name.length > 15 ? invoice.client.name.slice(0, 15) + '...' : invoice.client.name}` 
                        : 'Unknown client'}
                    </span>
                    {invoice.client && invoice.client.name && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-lg z-10 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="font-medium">{invoice.client.name}</div>
                        {invoice.client.address && (
                          <div className="text-sm text-neutral-600 mt-1">{invoice.client.address}</div>
                        )}
                        {invoice.client.gstin && (
                          <div className="text-sm text-neutral-600">GSTIN: {invoice.client.gstin}</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 w-[140px] whitespace-nowrap">{invoice.paymentType}</td>
                <td className="px-4 py-3 text-right font-medium w-[120px]">
                  <span className="font-sans">₹</span>
                  <span className="font-poppins">{formatCurrency(invoice.total).slice(1)}</span>
                </td>
                <td className="px-4 py-3 w-[150px]">
                  {editingRemark === invoice.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input py-1 px-2 text-sm w-full"
                        value={remarkText}
                        onChange={e => setRemarkText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveRemark(invoice.id);
                        }}
                      />
                      <button
                        className="text-primary-700 hover:text-primary-900"
                        onClick={() => saveRemark(invoice.id)}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer text-neutral-700 hover:text-primary-700 group relative"
                      onClick={() => handleRemarkEdit(invoice.id, invoice.remark)}
                    >
                      <span className="block truncate max-w-[140px]">
                        {invoice.remark ? `${invoice.remark.slice(0, 20)}...` : 'Add remark...'}
                      </span>
                      {invoice.remark && (
                        <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-lg z-10 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          {invoice.remark}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 w-[120px]">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/invoice/edit/${invoice.id}`}
                      className="btn-icon text-primary-700 hover:bg-primary-50 hover:scale-110 transition-all"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      className="btn-icon text-primary-700 hover:bg-primary-50 hover:scale-110 transition-all"
                      onClick={() => handleDuplicate(invoice)}
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      className="btn-icon text-primary-700 hover:bg-primary-50 hover:scale-110 transition-all"
                      onClick={() => handleDownloadPDF(invoice)}
                      disabled={downloadingId === invoice.id}
                    >
                      <Download size={18} className={downloadingId === invoice.id ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;