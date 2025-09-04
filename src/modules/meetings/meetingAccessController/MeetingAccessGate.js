

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { sendPaymentlink } from '@/features/meeting/paymentSlice'
import { getContactById, clearSelectedContact } from "@/features/contactSlice";

function MeetingAccessGate({ contactId, contactEmail , onCancel }) {
  const [isSending, setIsSending] = useState(false)
  const dispatch = useDispatch()
  const { selectedContact, status, error } = useSelector((state) => state.contact);
  // Fetch contact by ID when modal opens
  useEffect(() => {
    if ( contactId) {
      dispatch(getContactById(contactId));
    }
  }, [dispatch, contactId]);
console.log('Selected Contact:', selectedContact);
  const handleSendLink = async () => {
    if (!contactId || !contactEmail) {
      toast.error('❌ Missing contact ID or email')
      return
    }

    setIsSending(true)

    const payload = {
      amount: 1000,
      contactId,
     

    }

    try {
      await dispatch(sendPaymentlink(payload)).unwrap()
      toast.success('✅ Payment link sent successfully. Please complete the payment to schedule more meetings.')
    } catch (error) {
      toast.error('❌ Failed to send payment link')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={onCancel}
        className="border-gray-300 text-gray-700"
        disabled={isSending}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSendLink}
        className="bg-blue-600 text-white hover:bg-blue-700"
        disabled={isSending}
      >
        {isSending ? 'Sending...' : 'Send Payment Link'}
      </Button>
    </div>
  )
}

export default MeetingAccessGate