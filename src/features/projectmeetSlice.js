import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance3 } from '@/lib/axios';

// ✅ Fetch project meetings by email
export const fetchAllProjectMeetings = createAsyncThunk(
  'projectMeetings/fetchAllProjectMeetings',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/meetings/project/${projectId}`);
      
      return response.data.meetings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project meetings');
    }
  }
);

// ✅ Create a project meeting
export const createProjectMeeting = createAsyncThunk(
  'projectMeetings/createProjectMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post('/createteammeeting', meetingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project meeting');
    }
  }
);

// ✅ Update a project meeting
export const updateProjectMeeting = createAsyncThunk(
  'projectMeetings/updateProjectMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.post('/project-meeting/update', meetingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project meeting');
    }
  }
);

// ✅ Delete a project meeting
export const deleteProjectMeeting = createAsyncThunk(
  'projectMeetings/deleteProjectMeeting',
  async ({ id, email }, { rejectWithValue }) => {
    try {
      await axiosInstance3.delete(`/project-meeting/${email}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project meeting');
    }
  }
);

// ✅ Get project meeting by ID
export const getProjectMeetingById = createAsyncThunk(
  'projectMeetings/getProjectMeetingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance3.get(`/project-meeting/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project meeting');
    }
  }
);

// ✅ Initial state
const initialState = {
  meetings: [],
  selectedMeeting: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  modals: {
    isCreateOpen: false,
    isEditOpen: false,
    isViewOpen: false,
  },
};

// ✅ Slice
const projectMeetingSlice = createSlice({
  name: 'projectMeet',
  initialState,
  reducers: {
    clearProjectMeetingError: (state) => {
      state.error = null;
    },
    setSelectedProjectMeeting: (state, action) => {
      state.selectedMeeting = action.payload;
    },
    clearSelectedProjectMeeting: (state) => {
      state.selectedMeeting = null;
    },
    setCreateProjectModalOpen: (state, action) => {
      state.modals.isCreateOpen = action.payload;
    },
    setEditProjectModalOpen: (state, action) => {
      state.modals.isEditOpen = action.payload;
    },
    setViewProjectModalOpen: (state, action) => {
      state.modals.isViewOpen = action.payload;
    },
    closeAllProjectModals: (state) => {
      state.modals = {
        isCreateOpen: false,
        isEditOpen: false,
        isViewOpen: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProjectMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjectMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchAllProjectMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProjectMeeting.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createProjectMeeting.fulfilled, (state, action) => {
        state.createLoading = false;
        state.meetings.push(action.payload);
        state.modals.isCreateOpen = false;
      })
      .addCase(createProjectMeeting.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      .addCase(updateProjectMeeting.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProjectMeeting.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.meetings.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.meetings[index] = action.payload;
        }
        state.modals.isEditOpen = false;
      })
      .addCase(updateProjectMeeting.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteProjectMeeting.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteProjectMeeting.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.meetings = state.meetings.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteProjectMeeting.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      .addCase(getProjectMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeeting = action.payload;
      })
      .addCase(getProjectMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ✅ Export actions
export const {
  clearProjectMeetingError,
  setSelectedProjectMeeting,
  clearSelectedProjectMeeting,
  setCreateProjectModalOpen,
  setEditProjectModalOpen,
  setViewProjectModalOpen,
  closeAllProjectModals,
} = projectMeetingSlice.actions;

// ✅ Export reducer
export default projectMeetingSlice.reducer;
