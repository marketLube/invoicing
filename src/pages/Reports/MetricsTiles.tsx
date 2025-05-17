import React from 'react';
import { ArrowUpRight, DollarSign, FileText, TrendingUp, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface MetricsTilesProps {
  totalRevenue: number;
  invoiceCount: number;
  averageInvoice: number;
  taxCollected: number;
}

const MetricsTiles: React.FC<MetricsTilesProps> = ({
  totalRevenue,
  invoiceCount,
  averageInvoice,
  taxCollected,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-neutral-600 font-medium">Total Revenue</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-900">
            <DollarSign size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-neutral-600 font-medium">Invoices Issued</p>
            <p className="text-2xl font-semibold mt-1">{invoiceCount}</p>
          </div>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-900">
            <FileText size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-neutral-600 font-medium">Average Invoice</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(averageInvoice)}</p>
          </div>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-900">
            <TrendingUp size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-neutral-600 font-medium">Tax Collected</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(taxCollected)}</p>
          </div>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-900">
            <Receipt size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsTiles;