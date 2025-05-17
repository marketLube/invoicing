import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
    setIsSearching(false);
  }, [value]);
  
  // Handle search with visual indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Show searching indicator
    if (newValue && newValue !== value) {
      setIsSearching(true);
      
      // Immediately pass the value to parent - debouncing handled in Dashboard
      onChange(newValue);
    } else if (!newValue) {
      // Clear search immediately
      onChange('');
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <Loader2 size={16} className="text-primary-500 animate-spin" />
        ) : (
        <Search size={16} className="text-neutral-400" />
        )}
      </div>
      <input
        type="text"
        placeholder="Search by Invoice Number, Client Name or Remark"
        className="input pl-10 pr-10 py-2 w-full text-sm"
        value={localValue}
        onChange={handleInputChange}
      />
      {localValue && (
        <button
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
          onClick={clearSearch}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;