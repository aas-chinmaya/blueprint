import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Thunk to fetch all Team Lead details
export const fetchTeamLeads = createAsyncThunk(
  'dashboard/fetchTeamLeads',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/team/team-leads'); // adjust path as needed
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch team leads');
    }
  }
);

// Initial state
const initialState = {
  teamLeads: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // add other state slices as needed
};

const dashSlice = createSlice({
  name: 'dash',  // name should match usage in store and selectors
  initialState,
  reducers: {
    // synchronous reducers if any
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamLeads.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeamLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teamLeads = action.payload;
      })
      .addCase(fetchTeamLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dashSlice.reducer;
