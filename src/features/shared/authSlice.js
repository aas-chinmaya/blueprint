import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import Cookies from 'js-cookie';
import {
  axiosInstance,
  axiosInstance2
 
} from '@/lib/axios'
// Check token status
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {

      const response = await axiosInstance.post('/hrms/checkCookies');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Token check failed', dashboard: false });
    }
  }
);

// Login and send OTP
export const login = createAsyncThunk(
  'auth/login',
  async ({email, password}, { rejectWithValue }) => {
    try {

      const response = await axiosInstance2.post('/hrms/login', { email, password });
     
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/hrms/verifyOtp', { email, otp });
    
   
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'OTP verification failed');
    }
  }
);

// Logout from all devices
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const email = Cookies.get('email');
      const response = await axiosInstance.post('/hrms/logout', { email });
      Cookies.remove('token');
      Cookies.remove('email');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    loading: false,
    error: null,
    otpSent: false,
    user: null,
    token: null,
    email: null,
    isTokenChecked: false
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isTokenChecked = true;
        state.isAuthenticated = action.payload.dashboard;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isTokenChecked = true;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.email = action.payload.email;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        state.otpSent = false;
      })

      // Verify OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...state,
          isAuthenticated: false,
          otpSent: false,
          user: null,
          token: null,
          email: null,
          error: null
        };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload?.message;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
