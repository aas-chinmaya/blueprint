import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
export const fetchTeamByProjectId = createAsyncThunk(
  'projectTeam/fetchByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/team/getallteamsbyprojectid/${projectId}`);
      // console.log('Team data response:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Error fetching team:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch team details'
      );
    }
  }
);

const projectTeamSlice = createSlice({
  name: 'projectTeam',
  initialState: {
    teams: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamByProjectId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeamByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure teams is always an array and extract from data property
        state.teams = Array.isArray(action.payload.data) 
          ? action.payload.data 
          : action.payload.data 
            ? [action.payload.data] 
            : [];
        // console.log('Processed teams:', state.teams); // Debug log
      })
      .addCase(fetchTeamByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.teams = [];
      });
  }
});

export default projectTeamSlice.reducer;
