"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function ClientOnlyToaster(props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <Toaster {...props} />;
}
