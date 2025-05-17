import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { LineItem } from '../../types';
import { calculateItemTotal, formatCurrency } from '../../utils/helpers';

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({ items, onChange }) => {
  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        // For numeric fields, handle empty string as null or 0
        if (field === 'quantity' || field === 'unitPrice') {
          const numValue = value === '' ? 0 : Number(value);
          return { ...item, [field]: numValue };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newItems);
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      const newItems = items.filter(item => item.id !== id);
      onChange(newItems);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-primary-900 font-medium">Items</h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAddItem}
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left text-primary-900 text-sm font-medium">
                Description
              </th>
              <th className="px-4 py-2 text-right text-primary-900 text-sm font-medium w-24">
                Qty
              </th>
              <th className="px-4 py-2 text-right text-primary-900 text-sm font-medium w-48">
                Unit Price
              </th>
              <th className="px-4 py-2 text-right text-primary-900 text-sm font-medium w-48">
                Item Total
              </th>
              <th className="px-4 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="input w-full py-1"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="input w-full py-1 text-right"
                    value={item.quantity === 0 ? '' : item.quantity}
                    min="1"
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-sans">₹</span>
                    <input
                      type="number"
                      className="input w-full py-1 pl-8 text-right"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      min="0"
                      step="0.01"
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    />
                  </div>
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  <span className="font-sans">₹</span>
                  <span className="font-poppins">{formatCurrency(calculateItemTotal(item)).slice(1)}</span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="text-neutral-500 hover:text-error-main p-1 rounded hover:bg-neutral-100"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineItemsTable;