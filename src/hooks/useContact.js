import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getContactById } from '@/features/contactSlice'

export const useContactDetails = (contactId) => {
  const dispatch = useDispatch()

  const { selectedContact, status, error } = useSelector((state) => state.contact)

  useEffect(() => {
    if (contactId) {
      dispatch(getContactById(contactId))
    }
  }, [contactId, dispatch])

  return {
    contact: selectedContact,
    loading: status === 'loading',
    error,
  }
}
