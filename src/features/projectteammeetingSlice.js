import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance3,axiosInstance,axiosInstance2 } from '@/lib/axios';

// Thunk to get single team meeting data
export const getTeamMeetingData = createAsyncThunk(
  'projectTeamMeeting/getTeamMeetingData',
  async ({ projectId, teamLeadId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/api/projects/emails/${projectId}/${teamLeadId}`, {
        projectId,
        teamLeadId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team meeting data');
    }
  }
);
// Thunk to get all team meetings
export const getAllTeamMeetings = createAsyncThunk(
  'projectTeamMeeting/getAllTeamMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get('/team-meeting/all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all team meetings');
    }
  }
);

// Initial state scoped to the slice
const initialState = {
  teamMeetingLoading: false,
  teamMeetingError: null,
  currentTeamMeeting: null,
  allTeamMeetings: [],
};

const projectTeamMeetingSlice = createSlice({
  name: 'projectTeamMeeting',
  initialState,
  reducers: {
    clearProjectMeetingError: (state) => {
      state.teamMeetingError = null;
    },
    resetProjectTeamMeeting: (state) => {
      state.teamMeetingLoading = false;
      state.teamMeetingError = null;
      state.currentTeamMeeting = null;
      state.allTeamMeetings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get single meeting details
      .addCase(getTeamMeetingData.pending, (state) => {
        state.teamMeetingLoading = true;
        state.teamMeetingError = null;
      })
      .addCase(getTeamMeetingData.fulfilled, (state, action) => {
        state.teamMeetingLoading = false;
        state.currentTeamMeeting = action.payload;
      })
      .addCase(getTeamMeetingData.rejected, (state, action) => {
        state.teamMeetingLoading = false;
        state.teamMeetingError = action.payload;
      })

      // Get all meetings
      .addCase(getAllTeamMeetings.pending, (state) => {
        state.teamMeetingLoading = true;
        state.teamMeetingError = null;
      })
      .addCase(getAllTeamMeetings.fulfilled, (state, action) => {
        state.teamMeetingLoading = false;
        state.allTeamMeetings = action.payload;
      })
      .addCase(getAllTeamMeetings.rejected, (state, action) => {
        state.teamMeetingLoading = false;
        state.teamMeetingError = action.payload;
      });
  },
});

export const { clearProjectMeetingError, resetProjectTeamMeeting } = projectTeamMeetingSlice.actions;
export default projectTeamMeetingSlice.reducer;
