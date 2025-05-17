import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, parse, startOfMonth, endOfMonth, differenceInMonths, addMonths } from 'date-fns';
import { Invoice } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  invoices: Invoice[];
  startDate: Date;
  endDate: Date;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ invoices, startDate, endDate }) => {
  const chartData = useMemo(() => {
    // Generate array of months between start and end dates
    const monthDiff = differenceInMonths(endOfMonth(endDate), startOfMonth(startDate));
    const months = Array.from({ length: monthDiff + 1 }, (_, i) => {
      return addMonths(startOfMonth(startDate), i);
    });
    
    // Initialize data for each month
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, 'MMM yyyy');
      
      // Filter invoices for this month
      const monthInvoices = invoices.filter(
        inv => inv.date >= monthStart && inv.date <= monthEnd
      );
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const count = monthInvoices.length;
      
      return {
        month: monthLabel,
        revenue,
        count,
      };
    });
    
    return {
      labels: monthlyData.map(d => d.month),
      revenueData: monthlyData.map(d => d.revenue),
      countData: monthlyData.map(d => d.count),
    };
  }, [invoices, startDate, endDate]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Revenue',
        data: chartData.revenueData,
        borderColor: '#1A237E',
        backgroundColor: 'rgba(26, 35, 126, 0.5)',
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Invoice Count',
        data: chartData.countData,
        backgroundColor: 'rgba(97, 97, 97, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };
  
  return <Bar options={chartOptions} data={data} />;
};

export default RevenueChart;