


'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiBriefcase } from 'react-icons/fi';
import { fetchClients } from '@/features/projectSlice'; // Correct import

export default function ClientSelect({ value, onChange }) {
  const dispatch = useDispatch();
  const { clients, loading, error } = useSelector((state) => {
    return {
      clients: state.project.clients || [], // Fallback to empty array
      loading: state.project.status.fetch12lients, // Correct path
      error: state.project.error.clients,
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  if (loading === 'loading') {
    return <div>Loading clients...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filteredClients = Array.isArray(clients)
    ? clients.filter(
        (client) =>
          client.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.clientId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const selectedClient = Array.isArray(clients)
    ? clients.find((client) => client.clientId === value)
    : null;

  const handleSelect = (client) => {
    onChange(client.clientId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 hover:border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-2">
          <FiBriefcase className="text-gray-600" />
          <span className="text-black font-medium">
            {selectedClient ? selectedClient.clientName : 'Select Client'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 hover:border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black bg-white"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => handleSelect(client)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-black"
                >
                  <div className="font-medium text-black">{client.clientName}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-black">{client.clientId}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-black">{client.industryType}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-600">No clients found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}