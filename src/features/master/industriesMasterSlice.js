import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';

// Fetch all industries
export const fetchIndustries = createAsyncThunk(
    'industries/fetchIndustries',
    async (_, { rejectWithValue }) => {
        try {
        const response = await axiosInstance.get('/industry/getindustry');
        return response.data;
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch industries');
        }
    }
)

//Add new industry
export const addIndustry = createAsyncThunk(
    'industries/addIndustry',
    async (industryData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/industry/createindustry', industryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add industry');
        }
    }
);

// Update industry
export const updateIndustry = createAsyncThunk(
  'industries/updateIndustry',
  async (industryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/industry/updateIndustry/${industryData.id}`, industryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update industry');
    }
  }
);


// Delete industry
export const deleteIndustry = createAsyncThunk(
  'industries/deleteIndustry',
  async (industryId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/industry/deleteIndustry/${industryId}`);
      return industryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete industry');
    }
  }
);


// Get industry by ID
export const getIndustryById = createAsyncThunk(
  'industries/getIndustryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/industry/IndustryById/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch industry');
    }
  }
);

const initialState = {
  industries: [],
  selectedIndustry: null,
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

const industrySlice = createSlice({
  name: 'industries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedIndustry: (state, action) => {
      state.selectedIndustry = action.payload;
    },
    clearSelectedIndustry: (state) => {
      state.selectedIndustry = null;
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
      // Fetch industries
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add industry
      .addCase(addIndustry.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(addIndustry.fulfilled, (state, action) => {
        state.createLoading = false;
        state.industries.push(action.payload);
        state.modals.isCreateOpen = false;
      })
      .addCase(addIndustry.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update industry
      .addCase(updateIndustry.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateIndustry.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.industries.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.industries[index] = action.payload;
        }
        state.modals.isEditOpen = false;
      })
      .addCase(updateIndustry.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete industry
      .addCase(deleteIndustry.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteIndustry.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.industries = state.industries.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteIndustry.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Get industry by ID
      .addCase(getIndustryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIndustryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIndustry = action.payload;
      })
      .addCase(getIndustryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedIndustry,
  clearSelectedIndustry,
  setCreateModalOpen,
  setEditModalOpen,
  setViewModalOpen,
  closeAllModals,
} = industrySlice.actions;

export default industrySlice.reducer;