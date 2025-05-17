import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { FileDown, Mail } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import ReportDateFilter from './ReportDateFilter';
import MetricsTiles from './MetricsTiles';
import RevenueChart from './RevenueChart';
import BreakdownTable from './BreakdownTable';
import { getSummaryData } from '../../utils/helpers';

const Reports: React.FC = () => {
  const { invoices } = useInvoices();
  
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(today, 1)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(today));
  
  const handleLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start);
    setEndDate(end);
  };
  
  const handleThisMonth = () => {
    setStartDate(startOfMonth(today));
    setEndDate(endOfMonth(today));
  };
  
  const handleLastMonth = () => {
    const lastMonth = subMonths(today, 1);
    setStartDate(startOfMonth(lastMonth));
    setEndDate(endOfMonth(lastMonth));
  };
  
  const summaryData = getSummaryData(invoices, startDate, endDate);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-neutral-800">Reports & Analytics</h2>
        
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            <FileDown size={16} />
            Export CSV
          </button>
          <button className="btn btn-outline btn-sm">
            <Mail size={16} />
            Schedule Report
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <ReportDateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          
          <div className="flex gap-2">
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleLast30Days}
            >
              Last 30 Days
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleThisMonth}
            >
              This Month
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleLastMonth}
            >
              Last Month
            </button>
          </div>
        </div>
        
        <MetricsTiles
          totalRevenue={summaryData.totalRevenue}
          invoiceCount={summaryData.invoiceCount}
          averageInvoice={summaryData.averageInvoice}
          taxCollected={summaryData.taxCollected}
        />
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Revenue Trends</h3>
          <div className="h-80">
            <RevenueChart invoices={invoices} startDate={startDate} endDate={endDate} />
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Monthly Breakdown</h3>
          <BreakdownTable invoices={invoices} startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
};

export default Reports;