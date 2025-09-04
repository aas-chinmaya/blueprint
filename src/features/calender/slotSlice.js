import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios'; // make sure this is correctly configured

// ------------------------------------------
// Async Thunks
// ------------------------------------------

// Fetch all slots
export const fetchSlots = createAsyncThunk(
  'slots/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/slot/getallslots');
      return res.data.data; // Only return slot array
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create a new slot
export const createSlot = createAsyncThunk(
  'slots/create',
  async (slotData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/slots', slotData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete a slot by slotNo
export const deleteSlot = createAsyncThunk(
  'slots/delete',
  async (slotNo, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/slots/${slotNo}`);
      return slotNo;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ------------------------------------------
// Slice
// ------------------------------------------

const slotSlice = createSlice({
  name: 'slots',
  initialState: {
    slots: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch Slots
      .addCase(fetchSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
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
        state.slots = state.slots.filter((slot) => slot.slotNo !== action.payload);
      })
      .addCase(deleteSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slotSlice.reducer;
