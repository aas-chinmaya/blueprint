


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Fetch all MoMs
export const fetchMoMs = createAsyncThunk(
  'mom/fetchMoMs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/mom/getallmoms');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MoMs');
    }
  }
);

// Fetch MoM by Meeting ID
export const fetchMoMByMeetingId = createAsyncThunk(
  'mom/fetchMoMByMeetingId',
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mom/byMeeting/${meetingId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch MoM by meeting ID');
    }
  }
);

// Fetch MoM view (PDF binary data)
export const fetchMoMView = createAsyncThunk(
  'mom/fetchMoMView',
  async (momId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mom/view/${momId}`, {
        responseType: 'blob', // Handle binary PDF data
      });

      // Log response details for debugging
      // console.log('fetchMoMView response:', {
      //   status: response.status,
      //   headers: response.headers,
      //   contentType: response.headers['content-type'],
      // });

      // Validate response is a PDF
      const contentType = response.headers['content-type'];
      if (!contentType.includes('application/pdf')) {
        throw new Error('Response is not a valid PDF');
      }

      const pdfUrl = URL.createObjectURL(response.data); // Use response.data directly
      return { pdfUrl, momId };
    } catch (error) {
      // console.error('fetchMoMView error:', {
      //   message: error.message,
      //   response: error.response,
      //   status: error.response?.status,
      //   data: error.response?.data,
      // });
      return rejectWithValue(error.message || 'Failed to fetch MoM PDF');
    }
  }
);


// Async thunk to create MoM
export const createMoM = createAsyncThunk(
  "mom/createMoM",
  async (momData, { rejectWithValue }) => {
    try {
      console.log("Payload being sent:", momData); // Debug: Log the FormData
      for (let [key, value] of momData.entries()) {
        // console.log(`${key}:`, value); // Debug: Log FormData entries
      }
      const response = await axiosInstance.post("/mom/createmom", momData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      // console.error("Error in createMoM:", error); // Debug: Log errors
      return rejectWithValue(error.response?.data?.message || "Failed to create MoM");
    }
  }
);
// Update MoM

export const updateMoM = createAsyncThunk(
  "mom/updateMoM",
  async (momData, { rejectWithValue }) => {
    try {
     
      const response = await axiosInstance.post("/mom/createmom", momData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update MoM");
    }
  }
);
const momSlice = createSlice({
  name: 'mom',
  initialState: {
    // All MoMs
    mom: [],
    momLoading: false,
    momError: null,
    // MoM by Meeting ID
    momByMeetingId: null,
    momByMeetingIdLoading: false,
    momByMeetingIdError: null,
    // MoM View (PDF)
    momView: null,
    momViewLoading: false,
    momViewError: null,
  },
  reducers: {
    resetMoMByMeetingId: (state) => {
      if (state.momView?.pdfUrl) {
        URL.revokeObjectURL(state.momView.pdfUrl); // Clean up blob URL
      }
      state.momByMeetingId = null;
      state.momByMeetingIdLoading = false;
      state.momByMeetingIdError = null;
      state.momView = null;
      state.momViewLoading = false;
      state.momViewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all MoMs
      .addCase(fetchMoMs.pending, (state) => {
        state.momLoading = true;
        state.momError = null;
      })
      .addCase(fetchMoMs.fulfilled, (state, action) => {
        state.momLoading = false;
        state.mom = action.payload;
      })
      .addCase(fetchMoMs.rejected, (state, action) => {
        state.momLoading = false;
        state.momError = action.payload;
      })
      // Fetch MoM by Meeting ID
      .addCase(fetchMoMByMeetingId.pending, (state) => {
        state.momByMeetingIdLoading = true;
        state.momByMeetingIdError = null;
      })
      .addCase(fetchMoMByMeetingId.fulfilled, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingId = action.payload;
      })
      .addCase(fetchMoMByMeetingId.rejected, (state, action) => {
        state.momByMeetingIdLoading = false;
        state.momByMeetingIdError = action.payload;
      })
      // Fetch MoM View (PDF)
      .addCase(fetchMoMView.pending, (state) => {
        state.momViewLoading = true;
        state.momViewError = null;
      })
      .addCase(fetchMoMView.fulfilled, (state, action) => {
        state.momViewLoading = false;
        state.momView = action.payload;
      })
      .addCase(fetchMoMView.rejected, (state, action) => {
        state.momViewLoading = false;
        state.momViewError = action.payload;
      })
      // Create MoM
      .addCase(createMoM.pending, (state) => {
        state.momLoading = true;
        state.momError = null;
      })
      .addCase(createMoM.fulfilled, (state, action) => {
        state.momLoading = false;
        state.mom.push(action.payload); // Add new MoM to list
        state.momByMeetingId = action.payload; // Update current MoM
      })
      .addCase(createMoM.rejected, (state, action) => {
        state.momLoading = false;
        state.momError = action.payload;
      })
      // Update MoM
      .addCase(updateMoM.pending, (state) => {
        state.momLoading = true;
        state.momError = null;
      })
      .addCase(updateMoM.fulfilled, (state, action) => {
        state.momLoading = false;
        const updated = action.payload;
        state.mom = state.mom.map(m => m._id === updated._id ? updated : m);
        if (state.momByMeetingId && state.momByMeetingId._id === updated._id) {
          state.momByMeetingId = updated;
        }
      })
      .addCase(updateMoM.rejected, (state, action) => {
        state.momLoading = false;
        state.momError = action.payload;
      });
  },
});

export const { resetMoMByMeetingId } = momSlice.actions;
export default momSlice.reducer;