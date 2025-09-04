

// src/app/(protected)/quotation/create/page.js
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CreateQuotationForm from "@/modules/quotation/CreateQuotationForm";

// Component to handle search params within Suspense
function CreateQuotationContent() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const contactId = searchParams.get("contactId");

  return (
    <div className="">
      
      <CreateQuotationForm meetingId={meetingId} contactId={contactId} />
    </div>
  );
}

export default function CreateQuotationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-full bg-gray-200 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <CreateQuotationContent />
    </Suspense>
  );
}