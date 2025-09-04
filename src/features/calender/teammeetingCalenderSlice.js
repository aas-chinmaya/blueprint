import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance3 } from '@/lib/axios';

// Thunks renamed for team context

export const fetchTeamMeetings = createAsyncThunk(
  'teamMeetings/fetchTeamMeetings',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/upcoming/${email}`);
      return response.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team meetings');
    }
  }
);

export const createTeamMeeting = createAsyncThunk(
  'teamMeetings/createTeamMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post('/create-meeting', meetingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateTeamMeeting = createAsyncThunk(
  'teamMeetings/updateTeamMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post(`/meeting/update`, meetingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update team meeting');
    }
  }
);

export const deleteTeamMeeting = createAsyncThunk(
  'teamMeetings/deleteTeamMeeting',
  async ({ id, email }, { rejectWithValue }) => {
    try {
      await axiosInstance3.delete(`/meeting/${email}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete team meeting');
    }
  }
);

export const getTeamMeetingById = createAsyncThunk(
  'teamMeetings/getTeamMeetingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meeting/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team meeting');
    }
  }
);

export const fetchTeamMeetingsByContactId = createAsyncThunk(
  'teamMeetings/fetchTeamMeetingsByContactId',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/contact/${contactId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team meetings by contactId');
    }
  }
);

// Initial state
const initialState = {
  teamMeetings: [],
  selectedTeamMeeting: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  contactTeamMeetings: [],
  contactMeetingsLoading: false,
  contactMeetingsError: null,
  modals: {
    isCreateOpen: false,
    isEditOpen: false,
    isViewOpen: false,
  },
};

const teamMeetingSlice = createSlice({
  name: 'teamMeetings',
  initialState,
  reducers: {
    clearTeamMeetingError: (state) => {
      state.error = null;
    },
    setSelectedTeamMeeting: (state, action) => {
      state.selectedTeamMeeting = action.payload;
    },
    clearSelectedTeamMeeting: (state) => {
      state.selectedTeamMeeting = null;
    },
    setTeamCreateModalOpen: (state, action) => {
      state.modals.isCreateOpen = action.payload;
    },
    setTeamEditModalOpen: (state, action) => {
      state.modals.isEditOpen = action.payload;
    },
    setTeamViewModalOpen: (state, action) => {
      state.modals.isViewOpen = action.payload;
    },
    closeAllTeamModals: (state) => {
      state.modals.isCreateOpen = false;
      state.modals.isEditOpen = false;
      state.modals.isViewOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch team meetings
      .addCase(fetchTeamMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMeetings = action.payload;
      })
      .addCase(fetchTeamMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create team meeting
      .addCase(createTeamMeeting.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTeamMeeting.fulfilled, (state, action) => {
        state.createLoading = false;
        state.teamMeetings.push(action.payload);
        state.modals.isCreateOpen = false;
      })
      .addCase(createTeamMeeting.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update team meeting
      .addCase(updateTeamMeeting.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTeamMeeting.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.teamMeetings.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.teamMeetings[index] = action.payload;
        }
        state.modals.isEditOpen = false;
      })
      .addCase(updateTeamMeeting.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete team meeting
      .addCase(deleteTeamMeeting.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteTeamMeeting.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.teamMeetings = state.teamMeetings.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteTeamMeeting.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Get team meeting by ID
      .addCase(getTeamMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeamMeeting = action.payload;
      })
      .addCase(getTeamMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch team meetings by contact ID
      .addCase(fetchTeamMeetingsByContactId.pending, (state) => {
        state.contactMeetingsLoading = true;
        state.contactMeetingsError = null;
      })
      .addCase(fetchTeamMeetingsByContactId.fulfilled, (state, action) => {
        state.contactMeetingsLoading = false;
        state.contactTeamMeetings = action.payload.events;
      })
      .addCase(fetchTeamMeetingsByContactId.rejected, (state, action) => {
        state.contactMeetingsLoading = false;
        state.contactMeetingsError = action.payload;
      });
  },
});

export const {
  clearTeamMeetingError,
  setSelectedTeamMeeting,
  clearSelectedTeamMeeting,
  setTeamCreateModalOpen,
  setTeamEditModalOpen,
  setTeamViewModalOpen,
  closeAllTeamModals,
} = teamMeetingSlice.actions;

export default teamMeetingSlice.reducer;
