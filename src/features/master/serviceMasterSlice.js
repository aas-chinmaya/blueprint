import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Thunks

// Fetch all services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/service/getservice');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

// Add new service
export const addService = createAsyncThunk(
  'services/addService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/service/createservice', serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add service');
    }
  }
);

// Update service
export const updateService = createAsyncThunk(
  'services/updateService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/service/updateservice/${serviceData.id}`, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

// Delete service
export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/service/deleteservice/${serviceId}`);
      return serviceId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

// Get service by ID
export const getServiceById = createAsyncThunk(
  'services/getServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/service/getServiceById/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

const initialState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  modals: {
    isCreateOpen: false,
    isEditOpen: false,
    isViewOpen: false,
  },
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    setCreateModalOpen: (state, action) => {
      state.modals.isCreateOpen = action.payload;
    },
    setEditModalOpen: (state, action) => {
      state.modals.isEditOpen = action.payload;
    },
    setViewModalOpen: (state, action) => {
      state.modals.isViewOpen = action.payload;
    },
    closeAllModals: (state) => {
      state.modals.isCreateOpen = false;
      state.modals.isEditOpen = false;
      state.modals.isViewOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add service
      .addCase(addService.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.createLoading = false;
        state.services.push(action.payload);
        state.modals.isCreateOpen = false;
      })
      .addCase(addService.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update service
      .addCase(updateService.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.modals.isEditOpen = false;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete service
      .addCase(deleteService.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.services = state.services.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Get service by ID
      .addCase(getServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedService,
  clearSelectedService,
  setCreateModalOpen,
  setEditModalOpen,
  setViewModalOpen,
  closeAllModals,
} = serviceSlice.actions;

export default serviceSlice.reducer;
