'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePaymentDetails } from '@/hooks/usepaymentDetails'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoaderCircle } from 'lucide-react'

const PaymentWithRedirect = () => {
  const searchParams = useSearchParams()
  const contactId = searchParams.get('contactId')
  const [paymentDetails, setPaymentDetails] = useState(null)

  const paymentData = usePaymentDetails(contactId)

  useEffect(() => {
    if (paymentData) {
      setPaymentDetails(paymentData)
    }
  }, [paymentData])

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const isPaid = paymentDetails.status === 'paid'

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Payment Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Contact ID:</span>
            <span>{paymentDetails.contactId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{paymentDetails.contactEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>₹{paymentDetails.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <Badge variant="outline" className={isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
{paymentDetails?.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status Code:</span>
            <span>{paymentDetails.statusCode}</span>
          </div>
        </CardContent>

{/* 
        <CardFooter className="pt-4">
  <Button
    className="w-full"
    variant={isPaid ? 'success' : 'default'}
    onClick={() => {
      const popup = window.open(
        paymentDetails.paymentLink,
        '_blank',
        'width=800,height=600,noopener,noreferrer'
      )
     
    }}
  >
    {isPaid ? 'View Receipt' : 'Pay Now'}
  </Button>
</CardFooter> */}



<CardFooter className="pt-4">
  <Button
    className="w-full"
    variant={isPaid ? 'success' : 'default'}
    onClick={() => {
      const popup = window.open(
        paymentDetails.paymentLink,
        '_blank',
        'width=800,height=600,noopener,noreferrer'
      );

      // Log window immediately
      console.log('Popup opened:', popup.location.pathname);

      // Try logging pathname repeatedly
      const interval = setInterval(() => {
        try {
          console.log('Popup path:', popup.location.pathname);

          // Optional: Stop if path contains Razorpay pattern
          if (popup.location.pathname.includes('/payment-link/')) {
            console.log('Matched Razorpay path:', popup.location.pathname);
            clearInterval(interval);
          }
        } catch (e) {
          console.log('Still waiting for same-origin page...');
        }
      }, 1000);

      // Stop checking after 15s
      setTimeout(() => {
        clearInterval(interval);
        console.log('Stopped checking after timeout.');
      }, 15000);
    }}
  >
    {isPaid ? 'View Receipt' : 'Pay Now'}
  </Button>
</CardFooter>


      </Card>
    </div>
  )
}

export default PaymentWithRedirect





// 'use client';

// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { verifyStatusCode } from '@/features/meeting/paymentSlice';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Loader2, CheckCircle, XCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { Skeleton } from '@/components/ui/skeleton';

// export default function VerifyPaymentStatus() {
//   const dispatch = useDispatch();
//   const [contactId, setContactId] = useState('');
//   const { verifyStatus, verificationResult, error } = useSelector((state) => ({
//     verifyStatus: state.payment.verifyStatus,
//     verificationResult: state.payment.verificationResult,
//     error: state.payment.error,
//   }));

//   const handleVerify = () => {
//     if (!contactId.trim()) {
//       toast.error('Please enter a valid Contact ID');
//       return;
//     }
//     dispatch(verifyStatusCode(contactId)).then((result) => {
//       if (result.error) {
//         toast.error(`Verification failed: ${result.payload}`);
//       } else {
//         toast.success('Payment status verified successfully!');
//       }
//     });
//   };

//   // Status styles
//   const statusStyles = {
//     paid: 'bg-green-100 text-green-800 border-green-200',
//     unpaid: 'bg-red-100 text-red-800 border-red-200',
//     unknown: 'bg-gray-100 text-gray-800 border-gray-200',
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md border border-green-200 p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <CheckCircle className="w-8 h-8 text-green-600" />
//           <h1 className="text-2xl font-bold text-green-800">Verify Payment Status</h1>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 mb-6">
//           <Input
//             type="text"
//             value={contactId}
//             onChange={(e) => setContactId(e.target.value)}
//             placeholder="Enter Contact ID"
//             className="border-green-300 focus:border-green-500 focus:ring-green-500"
//           />
//           <Button
//             onClick={handleVerify}
//             className="bg-green-600 hover:bg-green-700 text-white"
//             disabled={verifyStatus === 'processing'}
//           >
//             {verifyStatus === 'processing' ? (
//               <Loader2 className="h-4 w-4 animate-spin mr-2" />
//             ) : (
//               'Verify'
//             )}
//           </Button>
//         </div>

//         {verifyStatus === 'processing' && (
//           <div className="p-6 space-y-4 bg-white rounded-lg shadow-md border border-green-200">
//             <Skeleton className="h-12 w-full rounded-lg" />
//             <Skeleton className="h-12 w-full rounded-lg" />
//           </div>
//         )}

//         {error && verifyStatus === 'error' && (
//           <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md border border-green-200">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
//               <XCircle className="text-3xl" />
//             </div>
//             <h3 className="text-xl font-semibold text-red-800 mb-2">Error verifying payment</h3>
//             <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
//             <Button
//               onClick={handleVerify}
//               className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-red-200 transition-all duration-300 hover:scale-105 active:scale-95"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                 ></path>
//               </svg>
//               Retry
//             </Button>
//           </div>
//         )}

//         {verifyStatus === 'success' && verificationResult && (
//           <div className="bg-white rounded-lg shadow-md border border-green-200 p-6">
//             <h2 className="text-xl font-semibold text-green-800 mb-4">Payment Status</h2>
//             <div className="grid gap-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right text-green-700">Contact ID</label>
//                 <span className="col-span-3 text-green-900">{verificationResult.contactId || 'N/A'}</span>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right text-green-700">Email</label>
//                 <span className="col-span-3 text-green-900">{verificationResult.contactEmail || 'N/A'}</span>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right text-green-700">Status Code</label>
//                 <span className="col-span-3 text-green-900">{verificationResult.statusCode || 'N/A'}</span>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right text-green-700">Status</label>
//                 <Badge
//                   className={`${
//                     statusStyles[verificationResult.status] || 'bg-gray-100 text-gray-800 border-gray-200'
//                   } border capitalize col-span-3`}
//                 >
//                   {verificationResult.status || 'N/A'}
//                 </Badge>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }