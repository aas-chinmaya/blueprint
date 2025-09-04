import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';

/* ========== Async Thunks ========== */

// Create MoM
export const createProjectMeetingMom = createAsyncThunk(
  'projectMeetingMom/create',
  async (momData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/projectmom/creatprojectmom', momData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project MoM');
    }
  }
);

// Fetch all MoMs (by projectId)
export const fetchAllProjectMoms = createAsyncThunk(
  'projectMeetingMom/fetchAll',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projectmom/fetchallmom/${projectId}`);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MoMs');
    }
  }
);

// Fetch single MoM by ID
export const fetchMeetingMomById = createAsyncThunk(
  'projectMeetingMom/fetchById',
  async (momId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projectmom/getmombymomId/${momId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MoM');
    }
  }
);

// Update MoM by ID
export const updateProjectMeetingMom = createAsyncThunk(
  'projectMeetingMom/update',
  async ({ momId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/projectmom/creatprojectmom`, updatedData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update MoM');
    }
  }
);

// Delete MoM by ID
export const deleteProjectMeetingMom = createAsyncThunk(
  'projectMeetingMom/delete',
  async (momId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projectmom/${momId}`);
      return momId; // return deleted ID so we can remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete MoM');
    }
  }
);

// Fetch MoM PDF view
export const fetchMeetingMomView = createAsyncThunk(
  'projectMeetingMom/fetchPdf',
  async (momId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projectmom/view/${momId}`, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'];
      if (!contentType.includes('application/pdf')) {
        throw new Error('Response is not a valid PDF');
      }

      const pdfUrl = URL.createObjectURL(response.data);
      return { pdfUrl, momId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch MoM PDF');
    }
  }
);

/* ========== Slice ========== */

const projectMeetingMomSlice = createSlice({
  name: 'projectMeetingMom',
  initialState: {
    moms: [], // list of all MoMs
    momsLoading: false,
    momsError: null,

    selectedMom: null,
    selectedMomLoading: false,
    selectedMomError: null,

    deleteSuccess: false,

    meetingMomView: null,
    meetingMomViewLoading: false,
    meetingMomViewError: null,
  },
  reducers: {
    resetSelectedMom: (state) => {
      state.selectedMom = null;
      state.selectedMomLoading = false;
      state.selectedMomError = null;
      state.deleteSuccess = false;
    },
    resetMeetingMomView: (state) => {
      state.meetingMomView = null;
      state.meetingMomViewLoading = false;
      state.meetingMomViewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create MoM
      .addCase(createProjectMeetingMom.pending, (state) => {
        state.selectedMomLoading = true;
        state.selectedMomError = null;
      })
      .addCase(createProjectMeetingMom.fulfilled, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMom = action.payload;
        state.moms.unshift(action.payload); // add new mom to top
      })
      .addCase(createProjectMeetingMom.rejected, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMomError = action.payload;
      })

      // Fetch all MoMs
      .addCase(fetchAllProjectMoms.pending, (state) => {
        state.momsLoading = true;
        state.momsError = null;
      })
      .addCase(fetchAllProjectMoms.fulfilled, (state, action) => {
        state.momsLoading = false;
        state.moms = action.payload;
      })
      .addCase(fetchAllProjectMoms.rejected, (state, action) => {
        state.momsLoading = false;
        state.momsError = action.payload;
      })

      // Fetch by ID
      .addCase(fetchMeetingMomById.pending, (state) => {
        state.selectedMomLoading = true;
        state.selectedMomError = null;
      })
      .addCase(fetchMeetingMomById.fulfilled, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMom = action.payload;
      })
      .addCase(fetchMeetingMomById.rejected, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMomError = action.payload;
      })

      // Update MoM
      .addCase(updateProjectMeetingMom.pending, (state) => {
        state.selectedMomLoading = true;
        state.selectedMomError = null;
      })
      .addCase(updateProjectMeetingMom.fulfilled, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMom = action.payload;
        state.moms = state.moms.map((mom) =>
          mom.id === action.payload.id ? action.payload : mom
        );
      })
      .addCase(updateProjectMeetingMom.rejected, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMomError = action.payload;
      })

      // Delete MoM
      .addCase(deleteProjectMeetingMom.pending, (state) => {
        state.selectedMomLoading = true;
        state.selectedMomError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteProjectMeetingMom.fulfilled, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMom = null;
        state.deleteSuccess = true;
        state.moms = state.moms.filter((mom) => mom.id !== action.payload);
      })
      .addCase(deleteProjectMeetingMom.rejected, (state, action) => {
        state.selectedMomLoading = false;
        state.selectedMomError = action.payload;
        state.deleteSuccess = false;
      })

      // Fetch MoM PDF
      .addCase(fetchMeetingMomView.pending, (state) => {
        state.meetingMomViewLoading = true;
        state.meetingMomViewError = null;
        state.meetingMomView = null;
      })
      .addCase(fetchMeetingMomView.fulfilled, (state, action) => {
        state.meetingMomViewLoading = false;
        state.meetingMomView = action.payload;
      })
      .addCase(fetchMeetingMomView.rejected, (state, action) => {
        state.meetingMomViewLoading = false;
        state.meetingMomViewError = action.payload;
        state.meetingMomView = null;
      });
  },
});

export const { resetSelectedMom, resetMeetingMomView } = projectMeetingMomSlice.actions;
export default projectMeetingMomSlice.reducer;


