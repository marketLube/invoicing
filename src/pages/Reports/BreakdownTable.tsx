import React, { useMemo } from 'react';
import { format, parse, startOfMonth, endOfMonth, differenceInMonths, addMonths } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';
import { Invoice } from '../../types';

interface BreakdownTableProps {
  invoices: Invoice[];
  startDate: Date;
  endDate: Date;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({ invoices, startDate, endDate }) => {
  const monthlyData = useMemo(() => {
    // Generate array of months between start and end dates
    const monthDiff = differenceInMonths(endOfMonth(endDate), startOfMonth(startDate));
    const months = Array.from({ length: monthDiff + 1 }, (_, i) => {
      return addMonths(startOfMonth(startDate), i);
    });
    
    // Initialize data for each month
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, 'MMMM yyyy');
      
      // Filter invoices for this month
      const monthInvoices = invoices.filter(
        inv => inv.date >= monthStart && inv.date <= monthEnd
      );
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const count = monthInvoices.length;
      const avgValue = count > 0 ? revenue / count : 0;
      
      return {
        month: monthLabel,
        revenue,
        count,
        avgValue,
      };
    }).reverse(); // Most recent month first
  }, [invoices, startDate, endDate]);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="table-header">
            <th className="px-4 py-3 text-left">Month</th>
            <th className="px-4 py-3 text-right">Revenue (₹)</th>
            <th className="px-4 py-3 text-right">Count</th>
            <th className="px-4 py-3 text-right">Avg. Value</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((data, index) => (
            <tr key={index} className="table-row">
              <td className="px-4 py-3 font-medium">{data.month}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(data.revenue)}</td>
              <td className="px-4 py-3 text-right">{data.count}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(data.avgValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BreakdownTable;