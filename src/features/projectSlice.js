
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Fetch project by ID
export const fetchProjectById = createAsyncThunk(
  'project/fetchById',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/getProjectById/${projectId}`);
      if (!response.data) {
        throw new Error('No data found for the given project ID');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  'project/editById',
  async ({ projectId, updatedData }, { rejectWithValue }) => {
    // console.log(updatedData);
    try {
      const response = await axiosInstance.put(`/projects/updateProject/${projectId}`, updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit project');
    }
  }
);

// Fetch all clients
export const fetchClients = createAsyncThunk(
  'project/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/client/getAllClients');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch clients');
    }
  }
);

// Fetch team leads
export const fetchTeamLeads = createAsyncThunk(
  'project/fetchTeamLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/hrms/employees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch team leads');
    }
  }
);


// Delete project by ID
export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/projects/soft-delete/${projectId}`);
      return { projectId, message: response.data?.message || 'Project deleted successfully' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);


// Create new project
export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
   
      const response = await axiosInstance.post('/projects/onboard', projectData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create project');
    }
  }
);

// Change project status
export const changeProjectStatus = createAsyncThunk(
  'project/changeProjectStatus',
  async ({ projectId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/projects/status/${projectId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to change project status');
    }
  }
);

// Fetch all projects
export const fetchAllProjects = createAsyncThunk(
  'project/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/projects/getallprojects');
      if (response.data) {
        const projectData = Array.isArray(response.data) ? response.data : 
          response.data.data || response.data.projects || [];
        return projectData;
      }
      console.log(response)
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

// Fetch projects by employee ID
export const fetchProjectsByEmployeeId = createAsyncThunk(
  'project/fetchProjectsByEmployeeId',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/by-person/${employeeId}`);
  
      return response.data.projects;
;
    } catch (error) {
      console.error('Error fetching projects by employee ID:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee projects');
    }
  }
);

const initialState = {
  project: null, // For single project data
  projects: [], // For all projects
  employeeProjects: [], // For projects by employee ID
  clients: [],
  teamLeads: [],
  status: {
    fetchProject: 'idle', // For fetchProjectById
    updateProject: 'idle', // For updateProject
    fetchClients: 'idle',
    fetchTeamLeads: 'idle',
    projectCreation: 'idle',
    statusChange: 'idle',
    fetchAllProjects: 'idle',
    fetchEmployeeProjects: 'idle',
     deleteProject: 'idle',
  },
  error: {
    fetchProject: null,
    updateProject: null,
    clients: null,
    teamLeads: null,
    projectCreation: null,
    statusChange: null,
    fetchAllProjects: null,
    fetchEmployeeProjects: null,
    deleteProject: null,
  },
  successMessage: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    resetProjectCreation: (state) => {
      state.status.projectCreation = 'idle';
      state.error.projectCreation = null;
      state.successMessage = null;
    },
    clearErrors: (state) => {
      state.error = {
        fetchProject: null,
        updateProject: null,
        clients: null,
        teamLeads: null,
        projectCreation: null,
        statusChange: null,
        fetchAllProjects: null,
        fetchEmployeeProjects: null,
      };
    },
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.status.fetchAllProjects = 'idle';
      state.error.fetchAllProjects = null;
    },
    clearEmployeeProjects: (state) => {
      state.employeeProjects = [];
      state.status.fetchEmployeeProjects = 'idle';
      state.error.fetchEmployeeProjects = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Project by ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.status.fetchProject = 'loading';
        state.error.fetchProject = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.status.fetchProject = 'succeeded';
        state.project = action.payload;
        state.error.fetchProject = null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.status.fetchProject = 'failed';
        state.error.fetchProject = action.payload;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.status.updateProject = 'updating';
        state.error.updateProject = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.status.updateProject = 'updated';
        state.project = action.payload;
        state.error.updateProject = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.status.updateProject = 'update_failed';
        state.error.updateProject = action.payload;
      })
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.status.fetchClients = 'loading';
        state.error.clients = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status.fetchClients = 'succeeded';
        state.clients = action.payload.clients || [];
        state.error.clients = null;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status.fetchClients = 'failed';
        state.error.clients = action.payload;
      })
      // Fetch Team Leads
      .addCase(fetchTeamLeads.pending, (state) => {
        state.status.fetchTeamLeads = 'loading';
        state.error.teamLeads = null;
      })
      .addCase(fetchTeamLeads.fulfilled, (state, action) => {
        state.status.fetchTeamLeads = 'succeeded';
        state.teamLeads = action.payload;
        state.error.teamLeads = null;
      })
      .addCase(fetchTeamLeads.rejected, (state, action) => {
        state.status.fetchTeamLeads = 'failed';
        state.error.teamLeads = action.payload;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.status.projectCreation = 'loading';
        state.error.projectCreation = null;
        state.successMessage = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.status.projectCreation = 'succeeded';
        state.successMessage = 'Project created successfully';
        state.error.projectCreation = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status.projectCreation = 'failed';
        state.error.projectCreation = action.payload;
      })
      // Change Project Status
      .addCase(changeProjectStatus.pending, (state) => {
        state.status.statusChange = 'loading';
        state.error.statusChange = null;
        state.successMessage = null;
      })
      .addCase(changeProjectStatus.fulfilled, (state, action) => {
        state.status.statusChange = 'succeeded';
        state.successMessage = 'Project status updated successfully';
        state.error.statusChange = null;
      })
      .addCase(changeProjectStatus.rejected, (state, action) => {
        state.status.statusChange = 'failed';
        state.error.statusChange = action.payload;
      })
      // Fetch All Projects
      .addCase(fetchAllProjects.pending, (state) => {
        state.status.fetchAllProjects = 'loading';
        state.error.fetchAllProjects = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.status.fetchAllProjects = 'succeeded';
        state.projects = action.payload;
        state.error.fetchAllProjects = null;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.status.fetchAllProjects = 'failed';
        state.error.fetchAllProjects = action.payload;
      })
      // Fetch Projects by Employee ID
      .addCase(fetchProjectsByEmployeeId.pending, (state) => {
        state.status.fetchEmployeeProjects = 'loading';
        state.error.fetchEmployeeProjects = null;
      })
      .addCase(fetchProjectsByEmployeeId.fulfilled, (state, action) => {
        state.status.fetchEmployeeProjects = 'succeeded';
        state.employeeProjects = action.payload;
        state.error.fetchEmployeeProjects = null;
      })
      .addCase(fetchProjectsByEmployeeId.rejected, (state, action) => {
        state.status.fetchEmployeeProjects = 'failed';
        state.error.fetchEmployeeProjects = action.payload;
      })
      // Delete Project
.addCase(deleteProject.pending, (state) => {
  state.status.deleteProject = 'loading';
  state.error.deleteProject = null;
  state.successMessage = null;
})
.addCase(deleteProject.fulfilled, (state, action) => {
  state.status.deleteProject = 'succeeded';
  state.projects = state.projects.filter(
    (project) => project._id !== action.payload.projectId
  );
  state.successMessage = action.payload.message;
  state.error.deleteProject = null;
})
.addCase(deleteProject.rejected, (state, action) => {
  state.status.deleteProject = 'failed';
  state.error.deleteProject = action.payload;
})

      
      
      ;
  },
});

export const {
  resetProjectCreation,
  clearErrors,
  resetSuccessMessage,
  clearProjects,
  clearEmployeeProjects,
  
} = projectSlice.actions;

export default projectSlice.reducer;