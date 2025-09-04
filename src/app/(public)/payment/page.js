'use client'

import { Suspense } from 'react';
import PaymentWithRedirect from "@/modules/payment/UserPaymentPage";
import { LoaderCircle } from 'lucide-react';

export default function Page() {
  return (
    <div className="text-xl font-semibold">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>}>
        <PaymentWithRedirect />
      </Suspense>
    </div>
  );
}