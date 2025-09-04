import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notification/getnotications/${recipientId}`);
      return response.data;
    } catch (error) {
      // console.error('Error fetching notifications:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk for deleting a single notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (_id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notification/soft/${_id}`);
      return _id;
    } catch (error) {
      // console.error('Error deleting notification:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Async thunk for deleting all notifications
export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (recipientId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notification/softdeleteall/${recipientId}`);
      return recipientId;
    } catch (error) {
      // console.error('Error deleting all notifications:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete all notifications');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [], // Ensure this is always an array
    loading: {
      fetch: false,
      delete: false,
      deleteAll: false
    },
    error: {
      fetch: null,
      delete: null,
      deleteAll: null
    }
  },
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.read = true;
      });
    },
    clearErrors: (state) => {
      state.error.fetch = null;
      state.error.delete = null;
      state.error.deleteAll = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.fetch = false;
        // Ensure we always store an array
        state.items = Array.isArray(action.payload) ? action.payload : 
                     action.payload?.data ? action.payload.data : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      })
      // Delete single notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
      })
      // Delete all notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.loading.deleteAll = true;
        state.error.deleteAll = null;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.loading.deleteAll = false;
        state.items = [];
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.loading.deleteAll = false;
        state.error.deleteAll = action.payload;
      });
  },
});

export const { markAsRead, markAllAsRead, clearErrors } = notificationSlice.actions;
export default notificationSlice.reducer;