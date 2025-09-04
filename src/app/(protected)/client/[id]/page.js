'use client';

import  ClientDetails from '@/modules/clients/ClientDetails';

export default function Page({ params }) {
  return (
    
    <>
     
    <ClientDetails clientId={params.id} />
      
    
    </>
  );
}
