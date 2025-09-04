





"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  FiUsers,
  FiUser,
  FiHash,
  FiFolder,
  FiCheck,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { toast } from 'sonner';
import { fetchTeamMembers, createTeam } from "@/features/teamSlice";

const CreateTeamForm = ({ projectDetails, onSuccess }) => {
  const dispatch = useDispatch();
  const { allMembers, status: membersStatus } = useSelector(
    (state) => state.team
  );
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  const memberOptions = useMemo(() => {
    if (!allMembers || !Array.isArray(allMembers)) return [];

    return allMembers.map((member) => ({
      value: member.employeeID,
      label: member.name || `${member.firstName} ${member.lastName}`.trim(),
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      id: member.employeeID,
      designation: member.designation,
    }));
  }, [allMembers]);

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      "&:hover": { borderColor: "#3B82F6" },
      boxShadow: "none",
      backgroundColor: "#FFFFFF",
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: "0.25rem",
      borderRadius: "0.5rem",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 20,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#EFF6FF"
        : state.isFocused
        ? "#F9FAFB"
        : "#FFFFFF",
      color: "#1F2937",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      "&:hover": { backgroundColor: "#F3F4F6" },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      color: "#1F2937",
      fontSize: "0.875rem",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EFF6FF",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1F2937",
      fontSize: "0.875rem",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#6B7280",
      "&:hover": { backgroundColor: "#BFDBFE", color: "#1F2937" },
    }),
  };

  useEffect(() => {
    const updatedRoles = {};
    selectedMembers.forEach((member) => {
      updatedRoles[member.value] = { value: member.designation, label: member.designation };
    });
    setMemberRoles(updatedRoles);
  }, [selectedMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!teamName.trim()) {
        throw new Error("Please enter a team name");
      }
      if (selectedMembers.length === 0) {
        throw new Error("Please select at least one team member");
      }

      const missingRoles = selectedMembers.filter(
        (member) => !memberRoles[member.value]?.value
      );
      if (missingRoles.length > 0) {
        throw new Error(
          `Designation missing for: ${missingRoles
            .map((m) => m.label)
            .join(", ")}`
        );
      }

      const formattedTeamMembers = selectedMembers.map((member) => ({
        memberId: member.value,
        memberName: member.label,
        role: memberRoles[member.value]?.value || member.designation,
        email: member.email,
      }));

      const teamData = {
        projectId: projectDetails.id,
        projectName: projectDetails.name,
        teamName: teamName.trim(),
        teamLeadId: projectDetails.teamLead.id,
        teamLeadName: projectDetails.teamLead.name,
        teamMembers: formattedTeamMembers,
      };

      const result = await dispatch(createTeam(teamData)).unwrap();
      if (result) {
        toast.success("Team created successfully!");
        setSelectedMembers([]);
        setMemberRoles({});
        setTeamName("");
        setIsModalOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create team";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = (memberToRemove) => {
    setSelectedMembers(
      selectedMembers.filter((member) => member.value !== memberToRemove.value)
    );
    const updatedRoles = { ...memberRoles };
    delete updatedRoles[memberToRemove.value];
    setMemberRoles(updatedRoles);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onSuccess?.();
  };

  const renderProjectDetails = () => {
    if (!projectDetails) return null;

    return (
      <div className="space-y-3 sm:space-y-4">
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiFolder className="h-4 w-4 text-gray-400" /> Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiHash className="h-4 w-4 text-gray-400" /> Project ID
          </label>
          <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm sm:text-base text-gray-700">
            {projectDetails.id || "N/A"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiFolder className="h-4 w-4 text-gray-400" /> Project Name
          </label>
          <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm sm:text-base text-gray-700">
            {projectDetails.name || "N/A"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiUser className="h-4 w-4 text-gray-400" /> Team Lead
          </label>
          <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {(projectDetails.teamLead?.name || "N/A").charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {projectDetails.teamLead?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                ID: {projectDetails.teamLead?.id || "N/A"}
              </p>
            </div>
          </div>
        </div>
      
      </div>
    );
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Create Team
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                  <FiUsers className="h-4 w-4 text-blue-600" /> Select Team
                  Members
                </label>
                <Select
                  isMulti
                  value={selectedMembers}
                  onChange={(selected) => {
                    const updatedSelected = selected ?? [];
                    setSelectedMembers(updatedSelected);
                  }}
                  options={memberOptions}
                  getOptionLabel={(e) => e.label}
                  getOptionValue={(e) => e.value}
                  isLoading={membersStatus === "loading"}
                  className="react-select z-1000"
                  classNamePrefix="react-select"
                  placeholder={
                    membersStatus === "loading"
                      ? "Loading team members..."
                      : "Select team members"
                  }
                  noOptionsMessage={() =>
                    memberOptions.length === 0
                      ? "No team members available"
                      : "No results found"
                  }
                  isSearchable
                  isClearable
                  styles={customSelectStyles}
                />
              </div>
              <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                {renderProjectDetails()}
              </div>
            </div>

            {/* Right Column - Selected Members */}
            <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                <FiUsers className="h-4 w-4 text-blue-600" /> Selected Team
                Members
              </h3>
              {selectedMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <FiUsers className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-sm font-medium">
                    No team members selected yet
                  </p>
                  <p className="text-xs">Select team members from the left</p>
                </div>
              ) : (
                <div className="space-y-3 h-full overflow-y-auto pr-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.value}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {member.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 z-5000">
                        <div
                          className="min-w-[120px] max-w-[150px] p-2 bg-gray-100 rounded-lg text-sm text-gray-700"
                          title={member.designation || "No designation"}
                        >
                          {member.designation || "N/A"}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member)}
                          className="p-1.5 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        >
                          <FiX className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm sm:text-base transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 text-white rounded-lg text-sm sm:text-base shadow-sm transition-all cursor-pointer ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="inline-block mr-2 animate-spin" />
                  Creating Team...
                </>
              ) : (
                <>
                  <FiCheck className="inline-block mr-2" />
                  Create Team
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTeamForm;