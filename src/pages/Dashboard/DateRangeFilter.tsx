import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <div className="w-full sm:w-auto">
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="From"
          dateFormat="dd/MM/yyyy"
          className="input py-2 w-full sm:w-[140px] text-sm"
        />
      </div>
      <span className="hidden sm:block text-neutral-400">-</span>
      <div className="w-full sm:w-auto">
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="To"
          dateFormat="dd/MM/yyyy"
          className="input py-2 w-full sm:w-[140px] text-sm"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;