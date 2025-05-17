import React from 'react';
import { Client } from '../../types';

interface ClientInfoProps {
  client: Client;
  onChange: (client: Client) => void;
}

const ClientInfo: React.FC<ClientInfoProps> = ({ client, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...client, [name]: value });
  };

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
      <h3 className="text-primary-900 font-medium mb-2">Bill To:</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="form-group">
          <label htmlFor="clientName" className="form-label">
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            name="name"
            className="input w-full"
            value={client.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="clientAddress" className="form-label">
            Address
          </label>
          <textarea
            id="clientAddress"
            name="address"
            rows={3}
            className="input w-full resize-none"
            value={client.address}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="clientGstin" className="form-label">
            GSTIN
          </label>
          <input
            type="text"
            id="clientGstin"
            name="gstin"
            className="input w-full"
            value={client.gstin || ''}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;