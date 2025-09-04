import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';

// ------------------------------------------------
// Async Thunks
// ------------------------------------------------

// Create a MOM
export const createTeamMeetingMom = createAsyncThunk(
  'teamMeetingMom/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/mom/createprojectmom', formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create MOM');
    }
  }
);

// Get all MOMs
export const getAllTeamMeetingMoms = createAsyncThunk(
  'teamMeetingMom/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/meetingmom/getall');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch MOMs');
    }
  }
);

// Get MOM by ID
export const getTeamMeetingMomById = createAsyncThunk(
  'teamMeetingMom/getById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/meetingmom/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch MOM detail');
    }
  }
);

// ------------------------------------------------
// Initial State
// ------------------------------------------------

const initialState = {
  allMoms: [],
  selectedMom: null,
  loading: false,
  error: null,
  success: null,
};

// ------------------------------------------------
// Slice
// ------------------------------------------------

const teamMeetingMomSlice = createSlice({
  name: 'teamMeetingMom',
  initialState,
  reducers: {
    clearMomState: (state) => {
      state.error = null;
      state.success = null;
      state.selectedMom = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createTeamMeetingMom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamMeetingMom.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'MOM created successfully';
        state.allMoms.push(action.payload);
      })
      .addCase(createTeamMeetingMom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All
      .addCase(getAllTeamMeetingMoms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTeamMeetingMoms.fulfilled, (state, action) => {
        state.loading = false;
        state.allMoms = action.payload;
      })
      .addCase(getAllTeamMeetingMoms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get By ID
      .addCase(getTeamMeetingMomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamMeetingMomById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMom = action.payload;
      })
      .addCase(getTeamMeetingMomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMomState } = teamMeetingMomSlice.actions;
export default teamMeetingMomSlice.reducer;
