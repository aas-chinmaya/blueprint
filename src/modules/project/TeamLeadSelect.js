'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiUser } from 'react-icons/fi';
import { fetchTeamLeads } from '@/features/projectSlice';

export default function TeamLeadSelect({ value, onChange, isOpen, onToggle, disabled }) {
  const dispatch = useDispatch();
  const { teamLeads, loading, error } = useSelector((state) => ({
    teamLeads: state.project.teamLeads,
    loading: state.project.status.fetchTeamLeads === 'loading',
    error: state.project.error.teamLeads,
  }));

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!teamLeads || teamLeads.length === 0) {
      dispatch(fetchTeamLeads());
    }
  }, [dispatch, teamLeads]);

  const filteredTeamLeads = Array.isArray(teamLeads)
    ? teamLeads.filter(
        (lead) =>
          (lead.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (lead.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (lead.employeeID?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : [];

  const selectedTeamLead = Array.isArray(teamLeads)
    ? teamLeads.find((lead) => lead.employeeID === value)
    : null;

  const handleSelect = (teamLead) => {
    if (onChange && teamLead) {
      onChange({
        teamLeadId: teamLead.employeeID,
        teamLeadName: `${teamLead.firstName} ${teamLead.lastName}`,
      });
      onToggle(); // Close dropdown
      setSearchQuery('');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 border ${
          disabled || loading ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 hover:border-black'
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between bg-white`}
        aria-label={selectedTeamLead ? `Selected team lead: ${selectedTeamLead.firstName} ${selectedTeamLead.lastName}` : 'Select a team lead'}
      >
        <div className="flex items-center gap-2">
          <FiUser className="text-gray-600" aria-hidden="true" />
          <span className="text-black font-medium">
            {loading ? 'Loading...' : selectedTeamLead ? `${selectedTeamLead.firstName} ${selectedTeamLead.lastName}` : 'Select Team Lead'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search team leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 hover:border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black bg-white"
                aria-label="Search team leads"
              />
            </div>
          </div>

          {loading && (
            <div className="p-4 text-center text-gray-600">Loading team leads...</div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">{error}</div>
          )}

          {!loading && !error && filteredTeamLeads.length === 0 && (
            <div className="p-4 text-center text-gray-600">No team leads found</div>
          )}

          {!loading && !error && filteredTeamLeads.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {filteredTeamLeads.map((teamLead) => (
                <button
                  key={teamLead.employeeID}
                  type="button"
                  onClick={() => handleSelect(teamLead)}
                  className="w-full px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-left text-black"
                  aria-label={`Select team lead: ${teamLead.firstName} ${teamLead.lastName}`}
                >
                  <div className="font-medium text-black">{`${teamLead.firstName} ${teamLead.lastName}`}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-black">{teamLead.employeeID}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}