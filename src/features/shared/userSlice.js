import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';

export const fetchUserByEmail = createAsyncThunk(
  'user/fetchByEmail',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/hrms/user/profile', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    employeeData: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.user;
        state.employeeData = action.payload.employee;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userSlice.reducer;
