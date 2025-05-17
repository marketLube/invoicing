import React from 'react';
import { PaymentType } from '../../types';
import { Wallet, CreditCard, CircleDot } from 'lucide-react';

interface TypeFilterProps {
  value: PaymentType | 'All';
  onChange: (value: PaymentType | 'All') => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ value, onChange }) => {
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
        className={`filter-chip ${value === 'Advance' ? 'active primary' : ''}`}
        onClick={() => onChange('Advance')}
      >
        <Wallet size={16} />
        <span>Advance</span>
      </button>
      <button
        className={`filter-chip ${value === 'Full Payment' ? 'active primary' : ''}`}
        onClick={() => onChange('Full Payment')}
      >
        <CreditCard size={16} />
        <span>Full Payment</span>
      </button>
    </div>
  );
};

export default TypeFilter;