import React from 'react';
import { InvoiceStatus } from '../../types';
import { CheckCircle2, XCircle, CircleDot } from 'lucide-react';

interface StatusFilterProps {
  value: InvoiceStatus | 'All';
  onChange: (value: InvoiceStatus | 'All') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`filter-chip ${value === 'All' ? 'active' : ''}`}
        onClick={() => onChange('All')}
      >
        <CircleDot size={16} />
        <span>All</span>
      </button>
      <button
        className={`filter-chip ${value === 'Paid' ? 'active success' : ''}`}
        onClick={() => onChange('Paid')}
      >
        <CheckCircle2 size={16} />
        <span>Paid</span>
      </button>
      <button
        className={`filter-chip ${value === 'Unpaid' ? 'active warning' : ''}`}
        onClick={() => onChange('Unpaid')}
      >
        <XCircle size={16} />
        <span>Unpaid</span>
      </button>
    </div>
  );
};

export default StatusFilter;