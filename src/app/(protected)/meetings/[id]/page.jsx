

// app/meeting/[Id]/page.js
"use client";

import { useParams } from "next/navigation";
import MeetingsPage from "@/modules/meetings/meeting/MeetingPage";

export default function MeetingDetailsPage() {
  const { id } = useParams(); // Extract meeting ID from URL
  return <MeetingsPage id={id} />;
}






