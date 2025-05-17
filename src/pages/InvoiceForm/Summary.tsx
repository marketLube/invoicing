import React from 'react';
import { formatCurrency } from '../../utils/helpers';

interface SummaryProps {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  taxMode: 'IGST' | 'CGST-SGST' | 'No GST';
}

const Summary: React.FC<SummaryProps> = ({
  subtotal,
  discountAmount,
  taxAmount,
  total,
  taxMode,
}) => {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 ml-auto">
      <h3 className="text-primary-900 font-semibold mb-3">SUMMARY</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span className="font-medium text-error-main">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        {taxAmount > 0 && (
          <>
            {taxMode === 'IGST' ? (
              <div className="flex justify-between text-sm">
                <span>IGST:</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            ) : taxMode === 'CGST-SGST' ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>CGST:</span>
                  <span className="font-medium">{formatCurrency(taxAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST:</span>
                  <span className="font-medium">{formatCurrency(taxAmount / 2)}</span>
                </div>
              </>
            ) : null}
          </>
        )}
        
        <div className="border-t border-primary-900 my-2 pt-2"></div>
        
        <div className="flex justify-between font-semibold">
          <span>Grand Total:</span>
          <span className="text-primary-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default Summary;