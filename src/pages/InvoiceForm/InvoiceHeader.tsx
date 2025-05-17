import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  onInvoiceNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (field: 'date' | 'dueDate', date: Date) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  date,
  dueDate,
  onInvoiceNumberChange,
  onDateChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl font-semibold text-primary-900">Invoice from Marketlube</h1>
        <div className="text-sm text-neutral-600 mt-2 space-y-1">
          <p>1414, Phase 1, Hilite Business Park,</p>
          <p>Calicut, Kerala 673014</p>
          <p>Phone: +91 9061663675</p>
          <p>Email: hello@marketlube.in</p>
          <p>Website: www.marketlube.in</p>
          <p>GSTIN: 32ABFFP2844M1Z2</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/3 mt-6 md:mt-0">
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="invoiceNumber" className="form-label">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              className="input w-full"
              value={invoiceNumber}
              onChange={onInvoiceNumberChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Invoice Date</label>
              <DatePicker
                selected={date}
                onChange={(date: Date) => onDateChange('date', date)}
                dateFormat="dd/MM/yyyy"
                className="input w-full"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date: Date) => onDateChange('dueDate', date)}
                dateFormat="dd/MM/yyyy"
                className="input w-full"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="select w-full" disabled>
              <option>INR (₹)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;