import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance3} from '@/lib/axios'; // Make sure this is correctly configured
// Async thunk to fetch all meetings
export const fetchAllMeetings = createAsyncThunk(
  'meetingCalendar/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get('/getallmeetings'); // Adjust endpoint as needed
      return response.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch meetings');
    }
  }
);

// Slice
const meetingCalendarSlice = createSlice({
  name: 'meetingCalendar',
  initialState: {
    meetings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchAllMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default meetingCalendarSlice.reducer;
