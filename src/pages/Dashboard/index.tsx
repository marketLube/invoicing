import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Copy, Filter, Settings, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import DateRangeFilter from './DateRangeFilter';
import InvoiceTable from './InvoiceTable';
import SearchBar from './SearchBar';
import StatusFilter from './StatusFilter';
import TypeFilter from './TypeFilter';
import PaymentInfoModal from './PaymentInfoModal';
import { InvoiceStatus, PaymentType } from '../../types';
import { debugSearch } from '../../lib/supabase';

const Dashboard: React.FC = () => {
  const { invoices, pagination, loadInvoices, loading } = useInvoices();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'All'>('All');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);

  // Initialize page
  useEffect(() => {
    loadInvoices(1);
  }, []);

  // Apply filters with debounce to avoid excessive API calls
  useEffect(() => {
    if (applyingFilters) {
      const timer = setTimeout(() => {
        applyFilters();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [applyingFilters]);

  // Function to handle filter changes
  const handleFilterChange = () => {
    setApplyingFilters(true);
  };

  // Apply all filters
  const applyFilters = () => {
    const filters = {
      searchQuery,
      startDate,
      endDate,
      status: statusFilter,
      paymentType: typeFilter
    };
    
    loadInvoices(1, filters);
    setApplyingFilters(false);
  };

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setApplyingFilters(true);
  };

  // Handle date filter changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setApplyingFilters(true);
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setApplyingFilters(true);
  };

  // Handle status filter changes
  const handleStatusFilterChange = (status: InvoiceStatus | 'All') => {
    setStatusFilter(status);
    setApplyingFilters(true);
  };

  // Handle payment type filter changes
  const handleTypeFilterChange = (type: PaymentType | 'All') => {
    setTypeFilter(type);
    setApplyingFilters(true);
  };

  const handlePageChange = (page: number) => {
    const filters = {
      searchQuery,
      startDate,
      endDate,
      status: statusFilter,
      paymentType: typeFilter
    };
    
    loadInvoices(page, filters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setStatusFilter('All');
    setTypeFilter('All');
    
    // Reset search and load first page
    loadInvoices(1);
  };

  const hasActiveFilters = searchQuery || startDate || endDate || statusFilter !== 'All' || typeFilter !== 'All';

  // Debug function
  const handleTestSearch = async () => {
    console.log('Current search query:', searchQuery);
    console.log('Current invoices:', invoices);
    
    if (searchQuery) {
      // Run debug search
      const result = await debugSearch(searchQuery);
      console.log('Debug search result:', result);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800">Invoice Dashboard</h2>
      </div>
      
      <div className="card w-full">
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 min-w-0">
              {loading && !searchQuery && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                </div>
              )}
              <SearchBar value={searchQuery} onChange={handleSearchChange} />
            </div>
            <button 
              className={`btn ${isFilterExpanded ? 'btn-primary' : 'btn-outline'} w-full sm:w-auto justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              disabled={loading}
            >
              <Filter size={16} />
              <span>{isFilterExpanded ? 'Hide Filters' : 'Show Filters'}</span>
              {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                className="btn btn-secondary sm:w-auto justify-center"
                onClick={handleTestSearch}
                disabled={loading}
              >
                Debug Search
              </button>
            )}
          </div>
          
          {isFilterExpanded && (
            <div className="space-y-4 pt-4 border-t border-neutral-200 min-h-[200px] w-full">
              {loading ? (
                <div className="flex items-center justify-center h-[200px] w-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                  <span className="ml-2 text-neutral-600">Loading filters...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium text-neutral-700">Date Range</label>
                    <DateRangeFilter 
                      startDate={startDate} 
                      endDate={endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Status</label>
                      <StatusFilter value={statusFilter} onChange={handleStatusFilterChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Payment Type</label>
                      <TypeFilter value={typeFilter} onChange={handleTypeFilterChange} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button 
                      className={`btn ${hasActiveFilters ? 'btn-error-outline' : 'btn-outline'} w-full sm:w-auto justify-center`}
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters || loading}
                    >
                      Clear All Filters
                    </button>
                    <button 
                      className="btn btn-outline w-full sm:w-auto justify-center"
                      onClick={() => setIsPaymentModalOpen(true)}
                      disabled={loading}
                    >
                      <Settings size={14} />
                      Edit Payment Info
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 table-responsive w-full">
          <div className="table-responsive-wrapper min-h-[400px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-[400px] w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <span className="ml-2 text-neutral-600">Loading invoices...</span>
              </div>
            ) : (
              <div className="w-full min-w-[800px] overflow-auto">
                <InvoiceTable invoices={invoices} />
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls - Always show a placeholder during loading */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 min-h-[60px] w-full">
          <div className="text-sm text-neutral-600 min-w-[180px]">
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500 mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                {pagination.totalCount > 0 ? (
                  <>
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
                    {pagination.totalCount} invoices
                  </>
                ) : (
                  <span>No invoices found</span>
                )}
              </>
            )}
          </div>
          
          {(pagination.totalPages > 1 || loading) && (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft size={16} />}
                Previous
              </button>
              
              <div className="flex items-center gap-1 min-w-[120px] justify-center">
                {loading ? (
                  // Placeholder pagination buttons during loading
                  <button className="btn btn-sm btn-outline" disabled>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </button>
                ) : (
                  // Actual pagination
                  (() => {
                    // Efficient pagination display logic for large datasets
                    const current = pagination.currentPage;
                    const total = pagination.totalPages;
                    
                    // Always show first page, last page, current page, and max 2 pages before and after current
                    const pageNumbers = new Set([1, total]);
                    
                    // Add current page and neighbors
                    for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
                      pageNumbers.add(i);
                    }
                    
                    // Convert to sorted array
                    const pages = Array.from(pageNumbers).sort((a, b) => a - b);
                    
                    // Return elements with ellipses where needed
                    return pages.map((page, index) => {
                      const showEllipsis = index > 0 && pages[index] - pages[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-neutral-400">...</span>
                          )}
                          <button
                            className={`btn btn-sm ${
                              page === current ? 'btn-primary' : 'btn-outline'
                            }`}
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    });
                  })()
                )}
              </div>
              
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
              >
                Next
                {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <ChevronRight size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isPaymentModalOpen && (
        <PaymentInfoModal onClose={() => setIsPaymentModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;