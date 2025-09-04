




import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';

// Create MoM
export const createProjectMoM = createAsyncThunk(
  'projectMom/createProjectMoM',
  async (momData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/mom/projectmom', momData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project MoM');
    }
  }
);

// Get MoM by meetingId (renamed from getMoMProjectById for clarity, aligned with component)
export const fetchMoMByMeetingId = createAsyncThunk(
  'projectMom/fetchMoMByMeetingId',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mom/byMeeting/${meetingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MoM');
    }
  }
);

// Update MoM by momId
export const updateProjectMoM = createAsyncThunk(
  'projectMom/updateProjectMoM',
  async ({ momId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/mom/${momId}`, updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update MoM');
    }
  }
);

// Delete MoM by momId
export const deleteProjectMoM = createAsyncThunk(
  'projectMom/deleteProjectMoM',
  async (momId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/mom/${momId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete MoM');
    }
  }
);

// Fetch MoM PDF View
export const fetchMoMView = createAsyncThunk(
  'projectMom/fetchMoMView',
  async (momId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mom/view/${momId}`, {
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

const projectMoMSlice = createSlice({
  name: 'projectMom',
  initialState: {
    momByMeetingId: null, // Renamed from projectMoM to match component
    momByMeetingIdLoading: false, // Renamed from projectMoMLoading
    momByMeetingIdError: null, // Renamed from projectMoMError
    deleteSuccess: false,
    momView: null, // Store pdfUrl and momId, replacing momPdfUrl
    momViewLoading: false, // Renamed from momPdfLoading
    momViewError: null, // Renamed from momPdfError
  },
  reducers: {
    resetMoMByMeetingId: (state) => {
      state.momByMeetingId = null;
      state.momByMeetingIdLoading = false;
      state.momByMeetingIdError = null;
      state.deleteSuccess = false;
    },
    resetMoMView: (state) => {
      state.momView = null;
      state.momViewLoading = false;
      state.momViewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createProjectMoM.pending, (state) => {
        state.momByMeetingIdLoading = true;
        state.momByMeetingIdError = null;
      })
      .addCase(createProjectMoM.fulfilled, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingId = action.payload;
      })
      .addCase(createProjectMoM.rejected, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingIdError = action.payload;
      })
      // Fetch by meetingId
      .addCase(fetchMoMByMeetingId.pending, (state) => {
        state.momByMeetingIdLoading = true;
        state.momByMeetingIdError = null;
      })
      .addCase(fetchMoMByMeetingId.fulfilled, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingId = action.payload;
      })
      .addCase(fetchMoMByMeetingId.rejected, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingIdError = action.payload;
      })
      // Update
      .addCase(updateProjectMoM.pending, (state) => {
        state.momByMeetingIdLoading = true;
        state.momByMeetingIdError = null;
      })
      .addCase(updateProjectMoM.fulfilled, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingId = action.payload;
      })
      .addCase(updateProjectMoM.rejected, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingIdError = action.payload;
      })
      // Delete
      .addCase(deleteProjectMoM.pending, (state) => {
        state.momByMeetingIdLoading = true;
        state.momByMeetingIdError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteProjectMoM.fulfilled, (state) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingId = null;
        state.deleteSuccess = true;
      })
      .addCase(deleteProjectMoM.rejected, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingIdError = action.payload;
        state.deleteSuccess = false;
      })
      // PDF View
      .addCase(fetchMoMView.pending, (state) => {
        state.momViewLoading = true;
        state.momViewError = null;
        state.momView = null;
      })
      .addCase(fetchMoMView.fulfilled, (state, action) => {
        state.momViewLoading = false;
        state.momView = action.payload;
      })
      .addCase(fetchMoMView.rejected, (state, action) => {
        state.momViewLoading = false;
        state.momViewError = action.payload;
        state.momView = null;
      });
  },
});

export const { resetMoMByMeetingId, resetMoMView } = projectMoMSlice.actions;
export default projectMoMSlice.reducer;



