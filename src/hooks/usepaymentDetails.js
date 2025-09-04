
// }
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPaymentLinkDetailsByContactId } from '@/features/meeting/paymentSlice';

export const usePaymentDetails = (contactId) => {
  const dispatch = useDispatch();

  const { paymentLinkRecord, getPaymentLinkStatus } = useSelector((state) => state.payment);

  useEffect(() => {
    if (contactId) {
      dispatch(getPaymentLinkDetailsByContactId(contactId));
    }
  }, [contactId, dispatch]);

  // Optional: Return loading/error state for the component to handle
  return paymentLinkRecord ? paymentLinkRecord : [];
  };

