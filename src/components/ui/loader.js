"use client";

import { Loader2 } from "lucide-react"; // Lucide icon
import { cn } from "@/lib/utils"; // Ensure this utility is present

export default function Loader({ className }) {
  return (
    <div
      className={cn(
        "h-screen w-full flex items-center justify-center bg-white z-50",
        className
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-green-700" />
    </div>
  );
}
