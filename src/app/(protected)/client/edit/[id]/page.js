'use client';

import UpdateClient from '@/modules/clients/UpdateClient';

export default function EditPage({ params }) {
  return (
      <>
       
          <UpdateClient clientId={params.id} />
          
        
        </>
  );
}
