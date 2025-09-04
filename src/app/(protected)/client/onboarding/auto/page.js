

'use client';

import React, { Suspense } from 'react';
import AutoOnbardingClient from '@/modules/clients/ClientAutoOnboarding';
import { useSearchParams } from 'next/navigation';

function OnboardingInnerContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contactId');
  return <AutoOnbardingClient contactId={contactId} />;
}

export default function ClientOnboardingPage() {
  return (
    <Suspense fallback={<div>Loading client onboarding...</div>}>
      <OnboardingInnerContent />
    </Suspense>
  );
}
