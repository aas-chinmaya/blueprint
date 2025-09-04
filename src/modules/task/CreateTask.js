




'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  FiEdit,
  FiUser,
  FiFlag,
  FiCalendar,
  FiInfo,
  FiUsers,
} from 'react-icons/fi';
import Select from 'react-select';
import { createTask, selectTaskStatus, selectTaskError, clearError } from '@/store/features/TaskSlice';
import { toast } from 'react-toastify';

const CreateTaskForm = ({ project_id, projectName, teamId, project }) => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // console.log('project prop:', project);
    // console.log('project.data.teamDetails:', project?.data?.teamDetails);

    const teamDetails = project?.data?.teamDetails || [];
    const filteredTeams = teamDetails
      .filter((team) => !team.isDeleted)
      .map((team) => ({
        teamId: team.teamId,
        teamLeadName: team.teamLeadName,
      }));

    // console.log('Filtered teams:', filteredTeams);

    setTeams(filteredTeams);
    setIsLoading(false);
  }, [project]);

  // console.log('all team list', teams);

  const dispatch = useDispatch();
  const router = useRouter();
  const taskStatus = useSelector(selectTaskStatus);
  const taskError = useSelector(selectTaskError);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignedBy: '',
    priority: '',
    deadline: '',
    projectId: project_id,
    projectName: projectName,
    teamId: teamId || '',
  });

  // Update assignedBy when teamId changes
  useEffect(() => {
    if (formData.teamId) {
      const selectedTeam = teams.find((team) => team.teamId === formData.teamId);
      if (selectedTeam) {
        setFormData((prev) => ({
          ...prev,
          assignedBy: selectedTeam.teamLeadName || '',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        assignedBy: '',
      }));
    }
  }, [formData.teamId, teams]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    // console.log('Selected team:', selectedOption);
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption?.value || '',
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'assignedTo', 'assignedBy', 'projectId'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(createTask(formData)).unwrap();
      if (result) {
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          assignedBy: '',
          priority: '',
          deadline: '',
          projectId: project_id,
          projectName: projectName,
          teamId: teamId || '',
        });
        toast.success('Task created successfully!');
      }
    } catch (err) {
      toast.error(`Failed to create task: ${err.message || 'Unknown error'}`);
      console.error('Failed to assign task:', err);
    }
  };

  const teamOptions = teams.map((team) => ({
    value: team.teamId,
    label: team.teamId,
  }));


  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      paddingLeft: '2.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: '#fff',
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: '#fff',
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#dbeafe' : '#fff',
      color: '#1f2937',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#eff6ff',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
    }),
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-t-3 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-sm sm:text-base">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">


      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-4xl mx-auto">
        {taskError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm sm:text-base">
            {taskError}
          </div>
        )}

        {taskStatus === 'loading' ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-t-3 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Creating task...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  name: 'title',
                  label: 'Task Title',
                  type: 'text',
                  icon: <FiEdit className="h-5 w-5 text-blue-500" />,
                  required: true,
                },
                {
                  name: 'assignedBy',
                  label: 'Assigned By',
                  type: 'text',
                  icon: <FiUser className="h-5 w-5 text-blue-500" />,
                  required: true,
                  disabled: true,
                },
                {
                  name: 'deadline',
                  label: 'Deadline',
                  type: 'date',
                  icon: <FiCalendar className="h-5 w-5 text-blue-500" />,
                  required: false,
                },
                {
                  name: 'priority',
                  label: 'Priority',
                  type: 'select',
                  icon: <FiFlag className="h-5 w-5 text-blue-500" />,
                  options: ['', 'Low', 'Medium', 'High'],
                  required: false,
                },
                {
                  name: 'teamId',
                  label: 'Team',
                  type: 'select',
                  icon: <FiUsers className="h-5 w-5 text-blue-500" />,
                  required: true,
                },
                {
                  name: 'assignedTo',
                  label: 'Assigned To',
                  type: 'text',
                  icon: <FiUser className="h-5 w-5 text-blue-500" />,
                  required: true, // Changed to required
                },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <div className="relative z-1000">
                    {field.type === 'select' && field.name === 'teamId' ? (
                      <Select
                        key={teams.map((t) => t.teamId).join('-')}
                        name={field.name}
                        options={teamOptions}
                        value={teamOptions.find((option) => option.value === formData.teamId) || null}
                        onChange={handleSelectChange('teamId')}
                        placeholder="Select team..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        styles={customSelectStyles}
                        isDisabled={teams.length === 0}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 z-1000 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 placeholder-gray-400 hover:bg-blue-50 transition-colors cursor-pointer"
                        required={field.required}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option} className="z-1000">
                            {option || `Select ${field.label.toLowerCase()}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={field.type === 'date' ? formData[field.name] : formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.label}
                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 placeholder-gray-400 hover:bg-blue-50 transition-colors cursor-pointer"
                        required={field.required}
                        min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                        disabled={field.disabled}
                      />
                    )}
                    <span className="absolute left-3 top-3 z-10">{field.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Task description"
                  rows={4}
                  className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 placeholder-gray-400 hover:bg-blue-50 transition-colors cursor-pointer resize-none"
                />
                <span className="absolute left-3 top-3 z-10">
                  <FiInfo className="h-5 w-5 text-blue-500" />
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors hover:bg-blue-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={taskStatus === 'loading'}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {taskStatus === 'loading' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Assigning...
                  </div>
                ) : (
                  'Assign Task'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTaskForm;




