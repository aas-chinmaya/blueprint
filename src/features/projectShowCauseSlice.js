import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';

// ========================
// THUNKS (Project Show Cause for MOM)
// ========================

// Submit Project MOM Show Cause
export const submitProjectShowCause = createAsyncThunk(
  'projectShowCause/submit',
  async ({ projectId, reason, submittedBy }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/projectshowcause/submit', {
        projectId,
     
        reason,
        submittedBy
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Submit failed' });
    }
  }
);

// Get Project MOM Show Cause by MOM ID
export const getProjectShowCauseByMomId = createAsyncThunk(
  'projectShowCause/getByMomId',
  async (momId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projectshowcause/mom/${momId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Not found' });
    }
  }
);

// Get All Project Show Causes
export const getAllProjectShowCauses = createAsyncThunk(
  'projectShowCause/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/projectshowcause/all');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Fetch failed' });
    }
  }
);

// Update Project Show Cause status by _id
export const updateProjectShowCauseStatusById = createAsyncThunk(
  'projectShowCause/updateStatusById',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/projectshowcause/updatestatus/${id}`, {
        status
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Update failed' });
    }
  }
);

// Update Project Show Cause status by MOM ID
export const updateProjectShowCauseStatusByMomId = createAsyncThunk(
  'projectShowCause/updateStatusByMomId',
  async ({ momId, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/projectshowcause/mom/${momId}/status`, {
        status
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Update failed' });
    }
  }
);

// ========================
// INITIAL STATE
// ========================

const initialState = {
  loading: false,
  error: null,
  projectShowCause: null,   // For single MOM fetch
  allProjectShowCauses: [], // For list
  submittedData: null       // For submit
};

// ========================
// SLICE
// ========================

const projectShowCauseSlice = createSlice({
  name: 'projectShowCause',
  initialState,
  reducers: {
    clearProjectShowCauseState: (state) => {
      state.loading = false;
      state.error = null;
      state.projectShowCause = null;
      state.submittedData = null;
    }
  },
  extraReducers: (builder) => {
    // === Submit ===
    builder.addCase(submitProjectShowCause.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitProjectShowCause.fulfilled, (state, action) => {
      state.loading = false;
      state.submittedData = action.payload.data;
    });
    builder.addCase(submitProjectShowCause.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Get by MOM ID ===
    builder.addCase(getProjectShowCauseByMomId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProjectShowCauseByMomId.fulfilled, (state, action) => {
      state.loading = false;
      state.projectShowCause = action.payload.data;
    });
    builder.addCase(getProjectShowCauseByMomId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Get All ===
    builder.addCase(getAllProjectShowCauses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllProjectShowCauses.fulfilled, (state, action) => {
      state.loading = false;
      state.allProjectShowCauses = action.payload.data;
    });
    builder.addCase(getAllProjectShowCauses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Update Status by ID ===
    builder.addCase(updateProjectShowCauseStatusById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProjectShowCauseStatusById.fulfilled, (state, action) => {
      state.loading = false;
      state.projectShowCause = action.payload.data;
    });
    builder.addCase(updateProjectShowCauseStatusById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Update Status by MOM ID ===
    builder.addCase(updateProjectShowCauseStatusByMomId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProjectShowCauseStatusByMomId.fulfilled, (state, action) => {
      state.loading = false;
      state.projectShowCause = action.payload.data;
    });
    builder.addCase(updateProjectShowCauseStatusByMomId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });
  }
});

// ========================
// EXPORTS
// ========================

export const { clearProjectShowCauseState } = projectShowCauseSlice.actions;

export default projectShowCauseSlice.reducer;
