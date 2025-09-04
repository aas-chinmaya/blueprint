import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance3 } from '@/lib/axios';

// ✅ Thunk: Get all meetings by project ID
export const getMeetingsByEmail = createAsyncThunk(
  'projectMeetings/getMeetingsByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/upcoming/${email}`);
      return response.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings for project');
    }
  }
);

// ✅ Initial state
const initialState = {
  projectmeetings: [],
  loading: false,
  // error: null,
};

// ✅ Slice
const projectMeetingsSlice = createSlice({
  name: 'projectMeetings',
  initialState,
  reducers: {
    clearProjectMeetingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMeetingsByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingsByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.projectmeetings = action.payload;
      })
      .addCase(getMeetingsByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProjectMeetingsError } = projectMeetingsSlice.actions;
export default projectMeetingsSlice.reducer;
