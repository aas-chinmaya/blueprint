import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// ========================
// THUNKS (Renamed to cause)
// ========================

// Submit Cause
export const submitCause = createAsyncThunk(
  'cause/submit',
  async ({ meetingId, reason, submittedBy }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/showcause/submit', {
        meetingId,
        reason,
        submittedBy
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Submit failed' });
    }
  }
);

// Get Cause by Meeting ID
export const getCauseByMeetingId = createAsyncThunk(
  'cause/getByMeetingId',
  async (meetingId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/showcause/meeting/${meetingId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Not found' });
    }
  }
);

// Get All Causes
export const getAllCauses = createAsyncThunk(
  'cause/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/showcause/all');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Fetch failed' });
    }
  }
);

// Update Cause status by _id
export const updateCauseStatusById = createAsyncThunk(
  'cause/updateStatusById',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/showcause/updatestatus/${id}`, {
        status
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Update failed' });
    }
  }
);

// Update Cause status by meetingId
export const updateCauseStatusByMeetingId = createAsyncThunk(
  'cause/updateStatusByMeetingId',
  async ({ meetingId, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/showcause/meeting/${meetingId}/status`, {
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
  cause: null,         // For single fetch
  allCauses: [],       // For list
  submittedData: null  // For submit
};

// ========================
// SLICE
// ========================

const causeSlice = createSlice({
  name: 'cause',
  initialState,
  reducers: {
    clearCauseState: (state) => {
      state.loading = false;
      state.error = null;
      state.cause = null;
      state.submittedData = null;
    }
  },
  extraReducers: (builder) => {
    // === Submit Cause ===
    builder.addCase(submitCause.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitCause.fulfilled, (state, action) => {
      state.loading = false;
      state.submittedData = action.payload.data;
    });
    builder.addCase(submitCause.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Get Cause by Meeting ID ===
    builder.addCase(getCauseByMeetingId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCauseByMeetingId.fulfilled, (state, action) => {
      state.loading = false;
      state.cause = action.payload.data;
    });
    builder.addCase(getCauseByMeetingId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Get All Causes ===
    builder.addCase(getAllCauses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllCauses.fulfilled, (state, action) => {
      state.loading = false;
      state.allCauses = action.payload.data;
    });
    builder.addCase(getAllCauses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Update Status by ID ===
    builder.addCase(updateCauseStatusById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCauseStatusById.fulfilled, (state, action) => {
      state.loading = false;
      state.cause = action.payload.data;
    });
    builder.addCase(updateCauseStatusById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // === Update Status by Meeting ID ===
    builder.addCase(updateCauseStatusByMeetingId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCauseStatusByMeetingId.fulfilled, (state, action) => {
      state.loading = false;
      state.cause = action.payload.data;
    });
    builder.addCase(updateCauseStatusByMeetingId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });
  }
});

// ========================
// EXPORTS
// ========================

export const { clearCauseState } = causeSlice.actions;

export default causeSlice.reducer;
