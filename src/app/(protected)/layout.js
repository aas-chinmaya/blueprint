// import ProtectedAppShell from "@/components/layout/ProtectedAppShell";

// // app/(protected)/layout.jsx
// export default function ProtectedLayout({ children }) {
//   return (
//     <>
//    {/* ✅ You can add Sidebar/Header here */}
//      <ProtectedAppShell>
//       {
//         children
//       }
//      </ProtectedAppShell>
    
//     </>
//   );
// }





'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/features/shared/authSlice';
import ProtectedAppShell from '@/components/layout/ProtectedAppShell';

export default function ProtectedLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, isTokenChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only call once on load
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isTokenChecked && !isAuthenticated) {
      // ✅ Use push instead of replace for redirect
      router.push('/login');
    }
  }, [isTokenChecked, isAuthenticated, router]);


  // ✅ Render children inside protected shell
  return (
    <ProtectedAppShell>
      {children}
    </ProtectedAppShell>
  );
}
