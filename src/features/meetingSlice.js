import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance3} from '@/lib/axios';
// Async thunks for API calls
export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/upcoming/${email}`);
      console.log('Fetched meetings:', response.data);
      return response.data.events;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings');
    }
  }
);

export const createMeeting = createAsyncThunk(
  'meetings/createMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post('/create-meeting', meetingData);

      
      // console.log("User not authorized",response.data);
      return response.data;
    } catch (error) {
      //  console.log("Error in createMeeting:", error.response?.url );

      return rejectWithValue(error);
    }
  }
);


export const updateMeeting = createAsyncThunk(
  'meetings/updateMeeting',
  async ( meetingData , { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post(`/meeting/update`, meetingData);
      // console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meeting');
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'meetings/deleteMeeting',
  async ({id,email}, { rejectWithValue }) => {
    try {
      await axiosInstance3.delete(`/meeting/${email}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meeting');
    }
  }
);

export const getMeetingById = createAsyncThunk(
  'meetings/getMeetingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meeting/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meeting');
    }
  }
);



export const fetchMeetingsByContactId = createAsyncThunk(
  'meetings/fetchMeetingsByContactId',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/contact/${contactId}`);
      // console.log("Fetched contact meetings:", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error in fetchMeetingsByContactId:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings by contactId');
    }
  }
);

const initialState = {
  meetings: [],
  selectedMeeting: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  contactMeetings: [],
  contactMeetingsLoading: false,
  contactMeetingsError: null,
  modals: {
    isCreateOpen: false,
    isEditOpen: false,
    isViewOpen: false,
  },
};

const meetingSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMeeting: (state, action) => {
      state.selectedMeeting = action.payload;
    },
    clearSelectedMeeting: (state) => {
      state.selectedMeeting = null;
    },
    setCreateModalOpen: (state, action) => {
      state.modals.isCreateOpen = action.payload;
    },
    setEditModalOpen: (state, action) => {
      state.modals.isEditOpen = action.payload;
    },
    setViewModalOpen: (state, action) => {
      state.modals.isViewOpen = action.payload;
    },
    closeAllModals: (state) => {
      state.modals.isCreateOpen = false;
      state.modals.isEditOpen = false;
      state.modals.isViewOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.createLoading = false;
        state.meetings.push(action.payload);
        state.modals.isCreateOpen = false;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update meeting
      .addCase(updateMeeting.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.meetings.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
        state.modals.isEditOpen = false;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.meetings = state.meetings.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // Get meeting by ID
      .addCase(getMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeeting = action.payload;
      })
      .addCase(getMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      // Fetch meetings by contact ID
       .addCase(fetchMeetingsByContactId.pending, (state) => {
  state.contactMeetingsLoading = true;
  state.contactMeetingsError = null;
})
.addCase(fetchMeetingsByContactId.fulfilled, (state, action) => {
  state.contactMeetingsLoading = false;
  state.contactMeetings = action.payload.events;
})
.addCase(fetchMeetingsByContactId.rejected, (state, action) => {
  state.contactMeetingsLoading = false;
  state.contactMeetingsError = action.payload;
})
;
  },
});

export const {
  clearError,
  setSelectedMeeting,
  clearSelectedMeeting,
  setCreateModalOpen,
  setEditModalOpen,
  setViewModalOpen,
  closeAllModals,
} = meetingSlice.actions;

export default meetingSlice.reducer;