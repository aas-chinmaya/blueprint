

'use client';
import { useState, useEffect } from 'react';
import Preloader from '@/components/loader/PreLoader';
import { ThemeProvider } from 'next-themes';

export default function PublicLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(() => performance.now());

  useEffect(() => {
    const renderTime = performance.now() - startTime;
    const animationCycle = 2000; // 2s per cycle
    const targetTime = Math.max(2 * animationCycle, renderTime * 2.2);

    const timer = setTimeout(() => {
      setLoading(false);
    }, targetTime);

    return () => clearTimeout(timer);
  }, [startTime]);

  return <> <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider></>;
  // return <>{children}</>;
  // return <>{loading ? <Preloader /> : children}</>;
}

