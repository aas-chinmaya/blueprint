import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
export const fetchCurrentProject = createAsyncThunk(
  'dashboard/fetchCurrentProject',
  async () => {
    try {
      const response = await axiosInstance.get('/projects/getallprojectswithallteams');
      
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch current project');
    }
  }
);

export const fetchAllClients = createAsyncThunk(
  'dashboard/fetchAllClients',
  async () => {
    try {
      const response = await axiosInstance.get('/client/getAllClients');
      return {
        data: response.data.clients,
        totalClients: response.data.totalClients || 0
      };
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const fetchClientInsights = createAsyncThunk(
  'dashboard/fetchClientInsights',
  async () => {
    try {
      const response = await axiosInstance.get('/client/insights');
      return {
        activeClients: response.data.clientsWithInProgressProjects.total || 0,
        newClients: response.data.clientsOnboardedLast3Months.total || 0,
        data: response.data
      };
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch client insights');
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  'dashboard/fetchProjectTasks',
  async () => {
    try {
      const response = await axiosInstance.get('/projects/projectswithtasks');
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch project tasks');
    }
  }
);

export const fetchProjectActivities = createAsyncThunk(
  'dashboard/fetchProjectActivities',
  async () => {
    try {
      const response = await axiosInstance.get('/projects/near-ending');
      // Transform the data to match the expected format
      const transformedData = response.data.projects.map(project => ({
        userInitials: project.teamLeadName?.charAt(0) || '#',
        project: {
          name: project.projectName,
          id: project.projectId
        },
        teamLead: project.teamLeadName,
        leadId: project.leadId,
        endDate: project.endDate,
        category: project.category,
        // Calculate days remaining
        daysRemaining: Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
        color: Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 ? 'red' : 
               Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 ? 'amber' : 
               'blue'
      }));
      return transformedData;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch project activities');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'dashboard/fetchProjectById',
  async (projectId) => {
    try {
        // console.log('Project data response:');
      const response = await axiosInstance.get(`/projects/getProjectById/${projectId}`);
      // console.log('Project data response:', response.data);
      
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch project details');
    }
  }
);

export const fetchTasksByDeadline = createAsyncThunk(
  'dashboard/fetchTasksByDeadline',
  async () => {
    try {
      const response = await axiosInstance.get('/task/bydeadline');
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch deadline tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'dashboard/fetchTaskById',
  async (taskId) => {
    try {
      const response = await axiosInstance.get(`/task/getbyid/${taskId}`);
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Failed to fetch task details');
    }
  }
);

const initialState = {
  currentProject: {
    title: '',
    startDate: '',
    endDate: '',
    status: 'loading', // loading, succeeded, failed
    error: null
  },
  clients: {
    data: null,
    totalClients: 0,
    status: 'idle',
    error: null
  },
  clientInsights: {
    activeClients: 0,
    newClients: 0,
    data: null,
    status: 'idle',
    error: null
  },
  projectTasks: {
    data: null,
    status: 'idle',
    error: null
  },
  projectActivities: {
    data: null,
    status: 'idle',
    error: null
  },
  selectedProject: {
    data: null,
    status: 'idle',
    error: null
  },
  deadlineTasks: {
    data: null,
    status: 'idle',
    error: null
  },
  selectedTask: {
    data: null,
    status: 'idle',
    error: null
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentProject.pending, (state) => {
        state.currentProject.status = 'loading';
      })
      .addCase(fetchCurrentProject.fulfilled, (state, action) => {
        state.currentProject = {
          ...action.payload,
          status: 'succeeded',
          error: null
        };
      })
      .addCase(fetchCurrentProject.rejected, (state, action) => {
        state.currentProject.status = 'failed';
        state.currentProject.error = action.error.message;
      });

    builder
      .addCase(fetchAllClients.pending, (state) => {
        state.clients.status = 'loading';
      })
      .addCase(fetchAllClients.fulfilled, (state, action) => {
        state.clients.status = 'succeeded';
        state.clients.data = action.payload.data;
        state.clients.totalClients = action.payload.totalClients;
        state.clients.error = null;
      })
      .addCase(fetchAllClients.rejected, (state, action) => {
        state.clients.status = 'failed';
        state.clients.error = action.error.message;
      });

    builder
      .addCase(fetchClientInsights.pending, (state) => {
        state.clientInsights.status = 'loading';
      })
      .addCase(fetchClientInsights.fulfilled, (state, action) => {
        state.clientInsights.status = 'succeeded';
        state.clientInsights.activeClients = action.payload.activeClients;
        state.clientInsights.newClients = action.payload.newClients;
        state.clientInsights.data = action.payload.data;
        state.clientInsights.error = null;
      })
      .addCase(fetchClientInsights.rejected, (state, action) => {
        state.clientInsights.status = 'failed';
        state.clientInsights.error = action.error.message;
      });

    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.projectTasks.status = 'loading';
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.projectTasks.status = 'succeeded';
        state.projectTasks.data = action.payload;
        state.projectTasks.error = null;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.projectTasks.status = 'failed';
        state.projectTasks.error = action.error.message;
      });

    builder
      .addCase(fetchProjectActivities.pending, (state) => {
        state.projectActivities.status = 'loading';
      })
      .addCase(fetchProjectActivities.fulfilled, (state, action) => {
        state.projectActivities.status = 'succeeded';
        state.projectActivities.data = action.payload;
        state.projectActivities.error = null;
      })
      .addCase(fetchProjectActivities.rejected, (state, action) => {
        state.projectActivities.status = 'failed';
        state.projectActivities.error = action.error.message;
      });

    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.selectedProject.status = 'loading';
        state.selectedProject.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.selectedProject.status = 'succeeded';
        state.selectedProject.data = action.payload;
        state.selectedProject.error = null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.selectedProject.status = 'failed';
        state.selectedProject.data = null;
        state.selectedProject.error = action.error.message;
      });

    builder
      .addCase(fetchTasksByDeadline.pending, (state) => {
        state.deadlineTasks.status = 'loading';
      })
      .addCase(fetchTasksByDeadline.fulfilled, (state, action) => {
        state.deadlineTasks.status = 'succeeded';
        state.deadlineTasks.data = action.payload;
        state.deadlineTasks.error = null;
      })
      .addCase(fetchTasksByDeadline.rejected, (state, action) => {
        state.deadlineTasks.status = 'failed';
        state.deadlineTasks.error = action.error.message;
      });

    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.selectedTask.status = 'loading';
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask.status = 'succeeded';
        state.selectedTask.data = action.payload;
        state.selectedTask.error = null;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.selectedTask.status = 'failed';
        state.selectedTask.error = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;


