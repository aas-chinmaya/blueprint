// store/features/slot/slotSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// 🚀 Create a new slot
export const createSlot = createAsyncThunk(
  'slot/create',
  async (slotData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/slot/createslot', slotData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 📥 Get all slots
export const fetchAllSlots = createAsyncThunk(
  'slot/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/slot/getallslots');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ❌ Delete slot by slotNo
export const deleteSlot = createAsyncThunk(
  'slot/delete',
  async (slotNo, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/slot/delteslot/${slotNo}`);
      return res.data.deleted;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🧠 Initial state
const initialState = {
  slots: [],
  loading: false,
  error: null,
};

const slotSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Slots
      .addCase(fetchAllSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(fetchAllSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Slot
      .addCase(createSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.slots.push(action.payload);
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Slot
      .addCase(deleteSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = state.slots.filter((s) => s.slotNo !== action.payload.slotNo);
      })
      .addCase(deleteSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slotSlice.reducer;
