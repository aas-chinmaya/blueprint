






// // src/store/slices/paymentSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import {axiosInstancePublic} from '@/lib/axios'

// // ✅ Thunk: Send payment link
// export const sendPaymentlink = createAsyncThunk(
//   'payment/sendPaymentlink',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstancePublic.post('/payment/create-payment-link', payload)
//       return response.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Payment submission failed')
//     }
//   }
// )

// // ✅ Thunk: Send status code
// export const sendStatusCode = createAsyncThunk(
//   'payment/sendStatusCode',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstancePublic.post('/payment/send-statuscode', payload)
//       return response.data
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Sending status code failed')
//     }
//   }
// )

// // ✅ Thunk: Verify status code
// export const verifyStatusCode = createAsyncThunk(
//   'payment/verifyStatusCode',
//   async (contactId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstancePublic.get(`/payment/statuscheck/${contactId}`)
//       const paymentDataArray = response.data.data

//       if (!paymentDataArray || paymentDataArray.length === 0) {
//         return { status: 'unpaid' }
//       }

//       return paymentDataArray[0]
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Verification failed')
//     }
//   }
// )

// // ✅ NEW THUNK: Get full payment link details by contactId
// export const getPaymentLinkDetailsByContactId = createAsyncThunk(
//   'payment/getPaymentLinkDetailsByContactId',
//   async (contactId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstancePublic.get(`/payment/paymentdetails/${contactId}`)
//       return response.data.data // assuming { data: { contactId, email, ... } }
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch payment link details')
//     }
//   }
// )
// // New Thunk: Delete payment link by contactId
// export const deletePaymentLink = createAsyncThunk(
//   'payment/deletePaymentLink',
//   async (contactId, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstancePublic.delete(`/payment/delete-link/${contactId}`);
//       return response.data; // Assuming response.data contains success message or deleted record details
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to delete payment link');
//     }
//   }
// );
// // ✅ Initial state
// const initialState = {
//   status: 'idle',
//   error: null,
//   statusCode: '',
//   countdown: 5,
//   paymentDetails: {
//     contactId: '',
//     email: '',
//     statusCode: '',
//     status: ''
//   },
//   sendStatus: 'idle',
//   verifyStatus: 'idle',
//   verificationResult: null,
//   getPaymentLinkStatus: 'idle',      // ✅ for getPaymentLinkDetailsByContactId
//   paymentLinkRecord: null            // ✅ stores full payment link object
//   ,deletePaymentLinkStatus: 'idle', // New state for deletePaymentLink
// }

// // ✅ Slice
// const paymentSlice = createSlice({
//   name: 'payment',
//   initialState,
//   reducers: {
//     setContactId: (state, action) => {
//       state.paymentDetails.contactId = action.payload
//     },
//     resetPayment: () => initialState,
//     setStatusCode: (state, action) => {
//       state.statusCode = action.payload
//       state.paymentDetails.statusCode = action.payload
//     },
//     decrementCountdown: (state) => {
//       if (state.countdown > 0) state.countdown -= 1
//     }
//   },
//   extraReducers: (builder) => {
//     builder

//       // ✅ Handle payment link sending
//       .addCase(sendPaymentlink.pending, (state) => {
//         state.status = 'processing'
//         state.error = null
//       })
//       .addCase(sendPaymentlink.fulfilled, (state) => {
//         state.status = 'success'
//         state.paymentDetails.status = 'completed'
//       })
//       .addCase(sendPaymentlink.rejected, (state, action) => {
//         state.status = 'error'
//         state.error = action.payload
//       })

//       // ✅ Handle status code sending
//       .addCase(sendStatusCode.pending, (state) => {
//         state.sendStatus = 'processing'
//       })
//       .addCase(sendStatusCode.fulfilled, (state) => {
//         state.sendStatus = 'success'
//       })
//       .addCase(sendStatusCode.rejected, (state, action) => {
//         state.sendStatus = 'error'
//         state.error = action.payload
//       })

//       // ✅ Handle status code verification
//       .addCase(verifyStatusCode.pending, (state) => {
//         state.verifyStatus = 'processing'
//       })
//       .addCase(verifyStatusCode.fulfilled, (state, action) => {
//         state.verifyStatus = 'success'
//         state.verificationResult = action.payload
//         state.paymentDetails.status = action.payload?.status || 'unknown'
//         state.paymentDetails.contactId = action.payload?.contactId || ''
//         state.paymentDetails.email = action.payload?.contactEmail || ''
//         state.paymentDetails.statusCode = action.payload?.statusCode || ''
//       })
//       .addCase(verifyStatusCode.rejected, (state, action) => {
//         state.verifyStatus = 'error'
//         state.error = action.payload
//       })

//       // ✅ Handle getPaymentLinkDetailsByContactId
//       .addCase(getPaymentLinkDetailsByContactId.pending, (state) => {
//         state.getPaymentLinkStatus = 'processing'
//       })
//       .addCase(getPaymentLinkDetailsByContactId.fulfilled, (state, action) => {
//         state.getPaymentLinkStatus = 'success'
//         state.paymentLinkRecord = action.payload
//       })
//       .addCase(getPaymentLinkDetailsByContactId.rejected, (state, action) => {
//         state.getPaymentLinkStatus = 'error'
//         state.error = action.payload
//       })


//       //to be deleted 
//           // New cases for deletePaymentLink
//       .addCase(deletePaymentLink.pending, (state) => {
//         state.deletePaymentLinkStatus = 'processing';
//       })
//       .addCase(deletePaymentLink.fulfilled, (state) => {
//         state.deletePaymentLinkStatus = 'success';
//         state.paymentLinkRecord = null; // Clear payment link record after deletion
//       })
//       .addCase(deletePaymentLink.rejected, (state, action) => {
//         state.deletePaymentLinkStatus = 'error';
//         state.error = action.payload;
//       });
//   }
// })

// // ✅ Exports
// export const {
//   setContactId,
//   resetPayment,
//   setStatusCode,
//   decrementCountdown
// } = paymentSlice.actions

// export default paymentSlice.reducer









































// src/store/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { axiosInstancePublic } from '@/lib/axios'

// ✅ Thunk: Send payment link
export const sendPaymentlink = createAsyncThunk(
  'payment/sendPaymentlink',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.post('/payment/create-payment-link', payload)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Payment submission failed')
    }
  }
)

// ✅ Thunk: Send status code
export const sendStatusCode = createAsyncThunk(
  'payment/sendStatusCode',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.post('/payment/send-statuscode', payload)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Sending status code failed')
    }
  }
)

// ✅ Thunk: Verify status code
export const verifyStatusCode = createAsyncThunk(
  'payment/verifyStatusCode',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.get(`/payment/statuscheck/${contactId}`)
      const paymentDataArray = response.data.data
      if (!paymentDataArray || paymentDataArray.length === 0) {
        return { status: 'unpaid' }
      }
      return paymentDataArray[0]
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Verification failed')
    }
  }
)

// ✅ Thunk: Get payment link details by contactId
export const getPaymentLinkDetailsByContactId = createAsyncThunk(
  'payment/getPaymentLinkDetailsByContactId',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.get(`/payment/paymentdetails/${contactId}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment link details')
    }
  }
)

// ✅ Thunk: Delete payment link
export const deletePaymentLink = createAsyncThunk(
  'payment/deletePaymentLink',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.delete(`/payment/delete-link/${contactId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete payment link')
    }
  }
)

// ✅ NEW: Get payment status by paymentId
export const getPaymentStatusByPaymentId = createAsyncThunk(
  'payment/getPaymentStatusByPaymentId',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.get(`/payment/razorpay/payment/${paymentId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get payment status')
    }
  }
)

// ✅ NEW: Update payment status by paymentId
export const updatePaymentStatusByPaymentId = createAsyncThunk(
  'payment/updatePaymentStatusByPaymentId',
  async ({ paymentId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstancePublic.put(`/payment/update-status/${paymentId}`, { status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update payment status')
    }
  }
)

// ✅ Initial state
const initialState = {
  status: 'idle',
  error: null,
  statusCode: '',
  countdown: 5,
  paymentDetails: {
    contactId: '',
    email: '',
    statusCode: '',
    status: ''
  },
  sendStatus: 'idle',
  verifyStatus: 'idle',
  verificationResult: null,
  getPaymentLinkStatus: 'idle',
  paymentLinkRecord: null,
  deletePaymentLinkStatus: 'idle',

  // ✅ NEW STATES
  getPaymentStatusByPaymentIdStatus: 'idle',
  paymentStatusResult: null,
  updatePaymentStatusByPaymentIdStatus: 'idle',
  updatePaymentStatusResult: null
}

// ✅ Slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setContactId: (state, action) => {
      state.paymentDetails.contactId = action.payload
    },
    resetPayment: () => initialState,
    setStatusCode: (state, action) => {
      state.statusCode = action.payload
      state.paymentDetails.statusCode = action.payload
    },
    decrementCountdown: (state) => {
      if (state.countdown > 0) state.countdown -= 1
    }
  },
  extraReducers: (builder) => {
    builder

      // ✅ sendPaymentlink
      .addCase(sendPaymentlink.pending, (state) => {
        state.status = 'processing'
        state.error = null
      })
      .addCase(sendPaymentlink.fulfilled, (state) => {
        state.status = 'success'
        state.paymentDetails.status = 'completed'
      })
      .addCase(sendPaymentlink.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })

      // ✅ sendStatusCode
      .addCase(sendStatusCode.pending, (state) => {
        state.sendStatus = 'processing'
      })
      .addCase(sendStatusCode.fulfilled, (state) => {
        state.sendStatus = 'success'
      })
      .addCase(sendStatusCode.rejected, (state, action) => {
        state.sendStatus = 'error'
        state.error = action.payload
      })

      // ✅ verifyStatusCode
      .addCase(verifyStatusCode.pending, (state) => {
        state.verifyStatus = 'processing'
      })
      .addCase(verifyStatusCode.fulfilled, (state, action) => {
        state.verifyStatus = 'success'
        state.verificationResult = action.payload
        state.paymentDetails.status = action.payload?.status || 'unknown'
        state.paymentDetails.contactId = action.payload?.contactId || ''
        state.paymentDetails.email = action.payload?.contactEmail || ''
        state.paymentDetails.statusCode = action.payload?.statusCode || ''
      })
      .addCase(verifyStatusCode.rejected, (state, action) => {
        state.verifyStatus = 'error'
        state.error = action.payload
      })

      // ✅ getPaymentLinkDetailsByContactId
      .addCase(getPaymentLinkDetailsByContactId.pending, (state) => {
        state.getPaymentLinkStatus = 'processing'
      })
      .addCase(getPaymentLinkDetailsByContactId.fulfilled, (state, action) => {
        state.getPaymentLinkStatus = 'success'
        state.paymentLinkRecord = action.payload
      })
      .addCase(getPaymentLinkDetailsByContactId.rejected, (state, action) => {
        state.getPaymentLinkStatus = 'error'
        state.error = action.payload
      })

      // ✅ deletePaymentLink
      .addCase(deletePaymentLink.pending, (state) => {
        state.deletePaymentLinkStatus = 'processing'
      })
      .addCase(deletePaymentLink.fulfilled, (state) => {
        state.deletePaymentLinkStatus = 'success'
        state.paymentLinkRecord = null
      })
      .addCase(deletePaymentLink.rejected, (state, action) => {
        state.deletePaymentLinkStatus = 'error'
        state.error = action.payload
      })

      // ✅ getPaymentStatusByPaymentId
      .addCase(getPaymentStatusByPaymentId.pending, (state) => {
        state.getPaymentStatusByPaymentIdStatus = 'processing'
      })
      .addCase(getPaymentStatusByPaymentId.fulfilled, (state, action) => {
        state.getPaymentStatusByPaymentIdStatus = 'success'
        state.paymentStatusResult = action.payload
      })
      .addCase(getPaymentStatusByPaymentId.rejected, (state, action) => {
        state.getPaymentStatusByPaymentIdStatus = 'error'
        state.error = action.payload
      })

      // ✅ updatePaymentStatusByPaymentId
      .addCase(updatePaymentStatusByPaymentId.pending, (state) => {
        state.updatePaymentStatusByPaymentIdStatus = 'processing'
      })
      .addCase(updatePaymentStatusByPaymentId.fulfilled, (state, action) => {
        state.updatePaymentStatusByPaymentIdStatus = 'success'
        state.updatePaymentStatusResult = action.payload
      })
      .addCase(updatePaymentStatusByPaymentId.rejected, (state, action) => {
        state.updatePaymentStatusByPaymentIdStatus = 'error'
        state.error = action.payload
      })
  }
})

// ✅ Exports
export const {
  setContactId,
  resetPayment,
  setStatusCode,
  decrementCountdown
} = paymentSlice.actions

export default paymentSlice.reducer

