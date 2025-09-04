import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { verifyStatusCode } from '@/features/meeting/paymentSlice'

export const usePaymentStatus = (contactId ) => {
  const dispatch = useDispatch()

  const { paymentDetails } = useSelector((state) => state.payment)
  useEffect(() => {
    if (contactId) {
      dispatch(verifyStatusCode(contactId))
    }
  }, [contactId, dispatch])
  // console.log(paymentDetails)

  const status = paymentDetails?.status?.toLowerCase?.() === 'paid' ? 'yes' : 'no'
  // console.log(paymentDetails)
// console.log("status",paymentDetails?.status?.toLowerCase?.() === 'paid' ? 'yes' : 'no')
  return status || "No Status found for Given ContactId!"
}
