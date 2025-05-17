import React from 'react';
import { PaymentType } from '../../types';

interface InvoiceTypeProps {
  paymentType: PaymentType;
  onChange: (type: PaymentType) => void;
}

const InvoiceType: React.FC<InvoiceTypeProps> = ({ paymentType, onChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-3">INVOICE</h2>
      
      <div className="inline-flex border border-neutral-300 rounded-md overflow-hidden">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            paymentType === 'Advance'
              ? 'bg-primary-900 text-white'
              : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
          }`}
          onClick={() => onChange('Advance')}
        >
          Advance
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            paymentType === 'Full Payment'
              ? 'bg-primary-900 text-white'
              : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
          }`}
          onClick={() => onChange('Full Payment')}
        >
          Full Payment
        </button>
      </div>
    </div>
  );
};

export default InvoiceType;