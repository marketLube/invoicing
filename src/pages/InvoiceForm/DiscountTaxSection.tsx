import React from 'react';

interface DiscountTaxSectionProps {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxMode: 'IGST' | 'CGST-SGST' | 'No GST';
  taxRate: number;
  onChange: (field: 'discountType' | 'discountValue' | 'taxMode' | 'taxRate', value: any) => void;
}

const DiscountTaxSection: React.FC<DiscountTaxSectionProps> = ({
  discountType,
  discountValue,
  taxMode,
  taxRate,
  onChange,
}) => {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
      <h3 className="text-primary-900 font-medium mb-3">Discount & Tax</h3>
      
      <div className="mb-4">
        <label className="form-label">Discount</label>
        <div className="flex items-center gap-3">
          <div className="inline-flex border border-neutral-300 rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm transition-colors ${
                discountType === 'percentage'
                  ? 'bg-primary-900 text-white'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
              onClick={() => onChange('discountType', 'percentage')}
            >
              %
            </button>
            <button
              className={`px-3 py-1 text-sm transition-colors ${
                discountType === 'fixed'
                  ? 'bg-primary-900 text-white'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
              onClick={() => onChange('discountType', 'fixed')}
            >
              ₹
            </button>
          </div>
          
          <div className="max-w-[150px]">
            <div className="relative">
              {discountType === 'fixed' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
              )}
              <input
                type="number"
                className={`input w-full py-1 ${
                  discountType === 'fixed' ? 'pl-8' : ''
                } ${
                  discountType === 'percentage' ? 'pr-7' : ''
                }`}
                value={discountValue}
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
                onChange={(e) => onChange('discountValue', parseFloat(e.target.value) || 0)}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
              />
              {discountType === 'percentage' && (
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2">%</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label className="form-label">Tax Mode</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="taxMode-igst"
                name="taxMode"
                className="mr-2"
                checked={taxMode === 'IGST'}
                onChange={() => onChange('taxMode', 'IGST')}
              />
              <label htmlFor="taxMode-igst" className="text-sm">IGST</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="taxMode-cgst-sgst"
                name="taxMode"
                className="mr-2"
                checked={taxMode === 'CGST-SGST'}
                onChange={() => onChange('taxMode', 'CGST-SGST')}
              />
              <label htmlFor="taxMode-cgst-sgst" className="text-sm">CGST & SGST</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="taxMode-no-gst"
                name="taxMode"
                className="mr-2"
                checked={taxMode === 'No GST'}
                onChange={() => onChange('taxMode', 'No GST')}
              />
              <label htmlFor="taxMode-no-gst" className="text-sm">No GST</label>
            </div>
          </div>
          
          {taxMode !== 'No GST' && (
            <div className="flex items-center gap-2">
              <label className="text-sm" htmlFor="taxRate">Rate:</label>
              <input
                type="number"
                id="taxRate"
                className="input py-1 w-24"
                value={taxRate}
                min="0"
                max="100"
                step="0.01"
                onChange={(e) => onChange('taxRate', parseFloat(e.target.value) || 0)}
              />
              <span className="text-sm">%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountTaxSection;