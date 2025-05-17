import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import type { PaymentInfo } from '../../types';

interface PaymentInfoModalProps {
  onClose: () => void;
}

const PaymentInfoModal: React.FC<PaymentInfoModalProps> = ({ onClose }) => {
  const { paymentInfo, updatePaymentInfo } = useInvoices();
  const [formData, setFormData] = useState<PaymentInfo>({
    accountName: paymentInfo.accountName,
    accountNumber: paymentInfo.accountNumber,
    ifsc: paymentInfo.ifsc,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-semibold text-primary-900 mb-4">
          Edit Payment Information
        </h3>
        
        <p className="text-neutral-600 mb-4">
          This information will appear on all invoices and PDFs.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accountName" className="form-label">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              className="input w-full"
              value={formData.accountName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="accountNumber" className="form-label">
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              className="input w-full"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ifsc" className="form-label">
              IFSC Code
            </label>
            <input
              type="text"
              id="ifsc"
              name="ifsc"
              className="input w-full"
              value={formData.ifsc}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentInfoModal;