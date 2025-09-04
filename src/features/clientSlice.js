
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Format file data from response or input
const formatFileData = (files, isFromServer = false) => {
  if (!files) return [];
  return files.map((file, index) => ({
    name: file.name,
    downloadLink: isFromServer ? file.url : null,
    index,
    type: file.type || 
          (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 
           file.name.toLowerCase().endsWith('.jpeg') || file.name.toLowerCase().endsWith('.jpg') ? 'image/jpeg' : 
           file.name.toLowerCase().endsWith('.png') ? 'image/png' : 'application/octet-stream'),
    size: file.size || null,
  }));
};

// Async Thunks
export const addClient = createAsyncThunk(
  'client/addClient',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/client/clientOnboard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error occurred' });
    }
  }
);

export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/client/getAllClients');
      return response.data.clients;
    } catch (error) {
      console.error('Error fetching clients:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'client/fetchClientById',
  async (clientId, { rejectWithValue }) => {
    try {
      if (!clientId) throw new Error('No client ID provided');
      const response = await axiosInstance.get(`/client/getClientById/${clientId}`);
      if (!response.data?.success || !response.data?.client) {
      
        throw new Error('Invalid response format from server');
      }
      const client = response.data.client;
      if (client.onboardingDate) {
        const date = new Date(client.onboardingDate);
        if (!isNaN(date.getTime())) {
          client.onboardingDate = date.toISOString().split('T')[0];
        }
      }
      return {
        success: response.data.success,
        message: response.data.message,
        client: {
          ...client,
          fileData: formatFileData(client.fileDownloadLinks || [], true),
        },
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client data');
    }
  }
);

export const fetchProjectsByClientId = createAsyncThunk(
  'client/fetchProjectsByClientId',
  async (clientId, { rejectWithValue }) => {
    try {
      if (!clientId) throw new Error('No client ID provided');
      const response = await axiosInstance.get(`/projects/getallprojectsbyclientid/${clientId}`);
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      const formattedProjects = response.data.map((project) => ({
        projectId: project.projectId || '',
        projectName: project.projectName || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        teamLeadName: project.teamLeadName || '',
        status: project.status || 'Planned',
      }));
      return formattedProjects;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project data');
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async (formData, { rejectWithValue }) => {
    try {
      const clientId = formData.get('clientId');
      if (!clientId) throw new Error('No client ID provided');
      formData.append('preserveFiles', 'true');
      const response = await axiosInstance.put(`/client/updateClient/${clientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      let data = response.data;
      if (data?.client) {
        data.client.fileData = formatFileData(data.client.fileDownloadLinks || [], true);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  formData: {
    clientName: '',
    industryType: '',
    contactEmail: '',
    contactNo: '',
    contactPersonName: '',
    address: '',
    onboardingDate: '',
    website: '',
    fileData: [],
  },
  clients: [],
  projects: [],
  addLoading: false,
  addError: null,
  addSuccess: false,
  fetchClientsLoading: false,
  fetchClientsError: null,
  fetchClientLoading: false,
  fetchClientError: null,
  fetchProjectsLoading: false,
  fetchProjectsError: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

// Slice
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addFile: (state, action) => {
      if (!state.formData.fileData) state.formData.fileData = [];
      state.formData.fileData.push({
        ...action.payload,
        index: state.formData.fileData.length,
        downloadLink: null,
      });
    },
    removeFile: (state, action) => {
      if (state.formData.fileData) {
        state.formData.fileData = state.formData.fileData.filter(
          (_, index) => index !== action.payload
        );
      }
    },
    resetForm: (state) => {
      state.formData = {
        clientName: '',
        industryType: '',
        contactEmail: '',
        contactNo: '',
        contactPersonName: '',
        address: '',
        onboardingDate: '',
        website: '',
        fileData: [],
      };
      state.addLoading = false;
      state.addError = null;
      state.addSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // addClient
      .addCase(addClient.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
        state.addSuccess = false;
      })
      .addCase(addClient.fulfilled, (state) => {
        state.addLoading = false;
        state.addSuccess = true;
      })
      .addCase(addClient.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload?.message || 'Failed to add client';
      })
      // fetchClients
      .addCase(fetchClients.pending, (state) => {
        state.fetchClientsLoading = true;
        state.fetchClientsError = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.fetchClientsLoading = false;
        state.clients = action.payload || [];
      })
      .addCase(fetchClients.rejected, (state, action) => {
        console.error('API call failed', action.payload);
        state.fetchClientsLoading = false;
        state.fetchClientsError = action.payload || 'Something went wrong';
      })
      // fetchClientById
      .addCase(fetchClientById.pending, (state) => {
        state.fetchClientLoading = true;
        state.fetchClientError = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.fetchClientLoading = false;
        if (action.payload?.client) {
          state.formData = action.payload.client;
        }
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.fetchClientLoading = false;
        state.fetchClientError = action.payload || 'Failed to fetch client data';
      })
      // fetchProjectsByClientId
      .addCase(fetchProjectsByClientId.pending, (state) => {
        state.fetchProjectsLoading = true;
        state.fetchProjectsError = null;
      })
      .addCase(fetchProjectsByClientId.fulfilled, (state, action) => {
        state.fetchProjectsLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjectsByClientId.rejected, (state, action) => {
        state.fetchProjectsLoading = false;
        state.fetchProjectsError = action.payload || 'Failed to fetch project data';
      })
      // updateClient
      .addCase(updateClient.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        if (action.payload?.client) {
          state.formData = {
            ...action.payload.client,
            fileData: action.payload.client.fileData || [],
          };
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || 'Failed to update client';
      });
  },
});

// Export actions and reducer
export const { updateFormData, addFile, removeFile, resetForm } = clientSlice.actions;
export default clientSlice.reducer;