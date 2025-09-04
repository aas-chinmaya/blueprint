

'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { FiUsers, FiX, FiHash, FiFolder, FiUser, FiCheck, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { updateTeam } from '@/features/teamMembersSlice';
import { fetchTeamMembers } from '@/features/teamSlice';

const EditTeam = ({
  selectedTeam,
  setShowEditTeam,
  setShowTeamDetails,
  setSelectedTeam,
}) => {
  const dispatch = useDispatch();
  const { allMembers, status: membersStatus } = useSelector((state) => state.team);

  const [selectedMembers, setSelectedMembers] = useState(
    selectedTeam.teamMembers.map((member) => ({
      value: member.memberId,
      label: member.memberName,
      email: member.email,
      designation: member.role,
    }))
  );

  const [memberRoles, setMemberRoles] = useState(
    selectedTeam.teamMembers.reduce(
      (acc, member) => ({
        ...acc,
        [member.memberId]: { value: member.role, label: member.role },
      }),
      {}
    )
  );

  const [formData, setFormData] = useState({
    projectId: selectedTeam.projectId,
    projectName: selectedTeam.projectName,
    teamName: selectedTeam.teamName || '',
    teamLeadId: selectedTeam.teamLeadId,
    teamLeadName: selectedTeam.teamLeadName,
  });

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  const memberOptions =
    allMembers?.map((member) => ({
      value: member.employeeID,
      label: member.name || `${member.firstName} ${member.lastName}`.trim(),
      email: member.email,
      designation: member.designation,
    })) || [];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#E5E7EB',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      '&:hover': { borderColor: '#3B82F6' },
      boxShadow: 'none',
      backgroundColor: '#FFFFFF',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 20,
      borderRadius: '0.5rem',
      border: '1px solid #E5E7EB',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#EFF6FF'
        : state.isFocused
        ? '#F9FAFB'
        : '#FFFFFF',
      color: '#1F2937',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
    }),
    input: (base) => ({
      ...base,
      color: '#1F2937',
      fontSize: '0.875rem',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#EFF6FF',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1F2937',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#6B7280',
      '&:hover': { backgroundColor: '#BFDBFE', color: '#1F2937' },
    }),
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.teamName.trim()) {
        throw new Error('Please enter a team name');
      }
      if (selectedMembers.length === 0) {
        throw new Error('Please select at least one team member');
      }

      const formattedTeamMembers = selectedMembers.map((member) => ({
        memberId: member.value,
        memberName: member.label,
        role: memberRoles[member.value]?.value || member.designation,
        email: member.email,
      }));

      const teamData = {
        projectId: formData.projectId,
        projectName: formData.projectName,
        teamName: formData.teamName.trim(),
        teamLeadId: formData.teamLeadId,
        teamLeadName: formData.teamLeadName,
        teamMembers: formattedTeamMembers,
      };

      const result = await dispatch(
        updateTeam({ teamId: selectedTeam.teamId, teamData })
      ).unwrap();

      if (result) {
        toast.success('Team updated successfully!');
        setShowEditTeam(false);
        setShowTeamDetails(true);
        setSelectedTeam({
          ...selectedTeam,
          ...teamData,
          teamMembers: formattedTeamMembers,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update team');
    }
  };

  const removeTeamMember = (memberToRemove) => {
    setSelectedMembers((prev) =>
      prev.filter((m) => m.value !== memberToRemove.value)
    );
    const updatedRoles = { ...memberRoles };
    delete updatedRoles[memberToRemove.value];
    setMemberRoles(updatedRoles);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 z-10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Edit Team</h3>
          <button
            onClick={() => setShowEditTeam(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                  <FiUsers className="text-blue-600" /> Select Team Members
                </label>
                <Select
                  isMulti
                  value={selectedMembers}
                  onChange={(selected) => {
                    const updated = selected ?? [];
                    setSelectedMembers(updated);
                    const updatedRoles = {};
                    updated.forEach((m) => {
                      updatedRoles[m.value] = {
                        value: m.designation,
                        label: m.designation,
                      };
                    });
                    setMemberRoles(updatedRoles);
                  }}
                  options={memberOptions}
                  isLoading={membersStatus === 'loading'}
                  placeholder="Select team members"
                  styles={customSelectStyles}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FiHash className="text-gray-400" /> Project ID
                  </label>
                  <input
                    type="text"
                    value={formData.projectId}
                    readOnly
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FiFolder className="text-gray-400" /> Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    readOnly
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FiFolder className="text-gray-400" /> Team Name
                  </label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="Enter team name"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FiUser className="text-gray-400" /> Team Lead
                  </label>
                  <input
                    type="text"
                    value={formData.teamLeadName}
                    readOnly
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <FiUsers className="text-blue-600" /> Selected Team Members
              </h4>
              {selectedMembers.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <FiUsers className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No team members selected</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.value}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {member.label}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="min-w-[120px] max-w-[150px] p-2 bg-gray-100 rounded-lg text-sm text-gray-700"
                          title={memberRoles[member.value]?.label || 'N/A'}
                        >
                          {memberRoles[member.value]?.label || 'N/A'}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member)}
                          className="p-1.5 hover:bg-red-100 rounded-full"
                        >
                          <FiX className="text-red-500 w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowEditTeam(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <FiCheck className="inline-block mr-1" />
              Update Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeam;