// src/store/features/contactSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';

// Thunk: Get all contacts
export const getAllContacts = createAsyncThunk(
  'contact/getAllContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/contact/getallcontact');
      return response.data.contacts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);
// Thunk: Get all contacts
export const getAllApprovedContacts = createAsyncThunk(
  'contact/geApprovedContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/contact/approved');
      return response.data.contacts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);

// Thunk: Get contact by ID
export const getContactById = createAsyncThunk(
  'contact/getContactById',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/contact/getcontactby/${contactId}`);
      return response.data.contact;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact');
    }
  }
);

// Thunk: Delete contact
export const deleteContact = createAsyncThunk(
  'contact/deleteContact',
  async (contactId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/contact/deletecontact/${contactId}`);
      return contactId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete contact');
    }
  }
);

// Thunk: Update contact status
export const updateContactStatus = createAsyncThunk(
  'contact/updateContactStatus',
  async ({ contactId,status,feedback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/contact/updatecontact/${contactId}`, {
        status,feedback
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact status');
    }
  }
);

// Initial State
const initialState = {
  contacts: [],
  Approvedcontacts: [],
  selectedContact: null,
  status: 'idle',
  error: null,
};

// Slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearSelectedContact: (state) => {
      state.selectedContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Contacts
      .addCase(getAllContacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = action.payload;
      })
      .addCase(getAllContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get All approvedContacts
      .addCase(getAllApprovedContacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllApprovedContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.Approvedcontacts = action.payload;
      })
      .addCase(getAllApprovedContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Get Contact by ID
      .addCase(getContactById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getContactById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedContact = action.payload;
      })
      .addCase(getContactById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = state.contacts.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Contact Status
      .addCase(updateContactStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.contacts.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.selectedContact && state.selectedContact._id === action.payload._id) {
          state.selectedContact = action.payload;
        }
      })
      .addCase(updateContactStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSelectedContact } = contactSlice.actions;
export default contactSlice.reducer;
