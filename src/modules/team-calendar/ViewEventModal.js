// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import TeamMeetingMOMDetails from "../meetings/team-meetings/TeamMeetingMOMDetails";

// const ViewEventModal = ({ isOpen, onClose, event }) => {
//   if (!event) return null;

//   const { title, start, end, extendedProps = {} } = event;

//   const {
//     description,
//     location,
//     hangoutLink,
//     htmlLink,
//     attendees = [],
//     organizer,
//     timeZone,
//     conferenceIcon,
//     entryPoint,
//   } = extendedProps;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
// <DialogContent className="w-full max-w-7xl md:w-[90vw] p-0 md:p-6 overflow-y-auto max-h-[90vh]">
//         <DialogHeader>
//           <DialogTitle className="text-xl">
//             {title || "Event Details"}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
//           {/* LEFT: Details Section */}
//           <div className="space-y-3 text-sm text-gray-700">
//             <div>
//               <strong>Start:</strong> {new Date(start).toLocaleString()}
//             </div>
//             <div>
//               <strong>End:</strong> {new Date(end).toLocaleString()}
//             </div>
//             {description && (
//               <div>
//                 <strong>Description:</strong> {description}
//               </div>
//             )}
//             {location && (
//               <div>
//                 <strong>Location:</strong> {location}
//               </div>
//             )}
//             {entryPoint && (
//               <div className="flex items-center gap-2">
//                 {conferenceIcon && (
//                   <img
//                     src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
//                     alt="Google Meet"
//                     width={40}
//                     height={40}
//                     className="object-contain"
//                   />
//                 )}
//                 <a
//                   href={entryPoint}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   Join Google Meet
//                 </a>
//               </div>
//             )}
//             {htmlLink && (
//               <div>
//                 <strong>Calendar Link:</strong>{" "}
//                 <a
//                   href={htmlLink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   Open in Google Calendar
//                 </a>
//               </div>
//             )}
//             {organizer && (
//               <div>
//                 <strong>Organizer:</strong> {organizer}
//               </div>
//             )}
//             {attendees.length > 0 && (
//               <div>
//                 <strong>Attendees:</strong>
//                 <ul className="list-disc list-inside pl-4">
//                   {attendees.map((a, i) => (
//                     <li key={i}>
//                       {a.email}{" "}
//                       <span className="text-gray-500">
//                         ({a.responseStatus})
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {timeZone && (
//               <div>
//                 <strong>Time Zone:</strong> {timeZone}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: Talk Column */}
//           <div className="bg-gray-50 border rounded-md p-4 h-full space-y-2">
//               {/* // aded later */}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ViewEventModal;





// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { format, isAfter, addHours } from "date-fns";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchMoMByMeetingId,
//   resetMoMByMeetingId,
//   createMoM,
//   updateMoM,
//   fetchMoMView,
// } from "@/features/momSlice";
// import { submitCause } from "@/features/causeSlice";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Loader2,
//   Download,
//   Edit2,
//   AlertCircle,
//   Calendar,
//   Users,
//   Clock,
//   FileText,
//   Signature,
//   User,
// } from "lucide-react";
// import { toast } from "sonner";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import Image from "next/image";

// const ViewEventModal = ({ isOpen, onClose, event }) => {
//   const dispatch = useDispatch();
//   const { momByMeetingId, momByMeetingIdLoading, momView, momViewLoading } = useSelector(
//     (state) => state.mom
//   );
//   const [mode, setMode] = useState("view");
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isTimeExceeded, setIsTimeExceeded] = useState(false);
//   const [isWithinOneHour, setIsWithinOneHour] = useState(false);
//   const [reasonForDelay, setReasonForDelay] = useState("");
//   const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
//   const [signatureFile, setSignatureFile] = useState(null);
//   const [signaturePreview, setSignaturePreview] = useState(null);
//   const containerRef = useRef(null);
//   const { currentUser } = useCurrentUser();

//   // Form state for creating/editing MoM
//   const [momForm, setMomForm] = useState({
//     agenda: "",
//     meetingMode: "Online",
//     duration: "",
//     participants: "",
//     summary: "",
//     notes: "",
//     createdBy: currentUser?.name || "",
//     meetingId: "",
//   });

//   // Helper: Format time (e.g., "10:00 AM")
//   const formatTimes = (dateTime) => {
//     if (!dateTime) return "";
//     try {
//       return format(new Date(dateTime), "p");
//     } catch {
//       return "";
//     }
//   };

//   // Helper: Compute duration as "startTime - endTime"
//   const getDurationString = useCallback(() => {
//     if (!event) return "";
//     const startTime = formatTimes(event.start);
//     const endTime = formatTimes(event.end);
//     return startTime && endTime ? `${startTime} - ${endTime}` : "";
//   }, [event]);

//   // Helper: Parse attendees into an array
//   const getAttendeesArray = (attendees) => {
//     if (!attendees) return [];
//     if (Array.isArray(attendees)) {
//       return attendees.map(a => a.email);
//     }
//     return String(attendees).split(",").map((p) => p.trim()).filter(Boolean);
//   };

//   // Helper: Check meeting time status
//   const checkMeetingTimeStatus = useCallback(() => {
//     if (!event?.end) return { isTimeExceeded: false, isWithinOneHour: false };
//     const endTime = new Date(event.end);
//     const now = new Date();
//     const oneHourAfterEnd = addHours(endTime, 1);
//     return {
//       isTimeExceeded: isAfter(now, endTime),
//       isWithinOneHour: isAfter(now, endTime) && !isAfter(now, oneHourAfterEnd),
//     };
//   }, [event]);

//   // Effect: Initialize form and check time status
//   useEffect(() => {
//     const { isTimeExceeded, isWithinOneHour } = checkMeetingTimeStatus();
//     setIsTimeExceeded(isTimeExceeded);
//     setIsWithinOneHour(isWithinOneHour);

//     if (event && momByMeetingId && momByMeetingId.meetingId === event.extendedProps?.meetingId) {
//       setMomForm({
//         agenda: momByMeetingId.agenda || event.extendedProps?.description || "",
//         meetingMode: momByMeetingId.meetingMode || (event.extendedProps?.location ? (event.extendedProps.location.includes("http") ? "Online" : "In-Person") : "Online"),
//         duration: momByMeetingId.duration || getDurationString() || "",
//         participants: Array.isArray(momByMeetingId.participants)
//           ? momByMeetingId.participants.join(", ")
//           : momByMeetingId.participants || getAttendeesArray(event.extendedProps?.attendees).join(", ") || "",
//         summary: momByMeetingId.summary || "",
//         notes: momByMeetingId.notes || "",
//         createdBy: momByMeetingId.createdBy || currentUser?.name || "",
//         meetingId: event.extendedProps?.meetingId || "",
//       });
//       setMode("view");
//       setIsEditMode(false);
//     } else if (event) {
//       setMomForm({
//         agenda: event.extendedProps?.description || "",
//         meetingMode: event.extendedProps?.location ? (event.extendedProps.location.includes("http") ? "Online" : "In-Person") : "Online",
//         duration: getDurationString() || "",
//         participants: getAttendeesArray(event.extendedProps?.attendees).join(", ") || "",
//         summary: "",
//         notes: "",
//         createdBy: currentUser?.name || "",
//         meetingId: event.extendedProps?.meetingId || "",
//       });
//       setMode("form");
//       setIsEditMode(false);
//     }

//     setReasonForDelay(momByMeetingId?.reasonForDelay || "");
//     setIsAgreedToTerms(false);
//     setSignatureFile(null);
//     setSignaturePreview(null);
//   }, [momByMeetingId, event, checkMeetingTimeStatus, getDurationString, currentUser?.name]);

//   // Effect: Fetch MoM data when modal opens
//   useEffect(() => {
//     if (isOpen && event?.extendedProps?.meetingId) {
//       dispatch(fetchMoMByMeetingId(event.extendedProps.meetingId));
//     }
//   }, [isOpen, event, dispatch]);

//   // Effect: Fetch MoM view when available
//   useEffect(() => {
//     if (isOpen && momByMeetingId?.momId && mode === "view") {
//       dispatch(fetchMoMView(momByMeetingId.momId));
//     }
//   }, [isOpen, momByMeetingId?.momId, mode, dispatch]);

//   // Effect: Clean up blob URL and reset state
//   useEffect(() => {
//     return () => {
//       if (momView?.pdfUrl) {
//         URL.revokeObjectURL(momView.pdfUrl);
//       }
//       if (signaturePreview) {
//         URL.revokeObjectURL(signaturePreview);
//       }
//       if (!isOpen) {
//         dispatch(resetMoMByMeetingId());
//       }
//     };
//   }, [isOpen, momView?.pdfUrl, signaturePreview, dispatch]);

//   // Handler: Form input changes
//   const handleMomFormChange = (e, field) => {
//     setMomForm({ ...momForm, [field]: e.target.value });
//   };

//   // Handler: Reason for delay change
//   const handleReasonForDelayChange = (e) => {
//     setReasonForDelay(e.target.value);
//   };

//   // Handler: Signature file change
//   const handleSignatureFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
//       setSignatureFile(file);
//       setSignaturePreview(URL.createObjectURL(file));
//     } else {
//       toast.error("Please upload a valid image file (.png, .jpg, .jpeg).");
//       setSignatureFile(null);
//       setSignaturePreview(null);
//     }
//   };

//   // Handler: Terms agreement checkbox
//   const handleTermsChange = (checked) => {
//     setIsAgreedToTerms(checked);
//   };

//   // Helper: Check if all required fields are filled
//   const areRequiredFieldsFilled = () => {
//     return (
//       momForm.createdBy.trim() &&
//       momForm.summary.trim() &&
//       signatureFile &&
//       (!isTimeExceeded || (reasonForDelay.trim() && isAgreedToTerms))
//     );
//   };

//   // Handler: Form submission
//   const handleSubmit = async () => {
//     if (!momForm.createdBy.trim()) {
//       toast.info("Please enter the name of the person who created the MoM.");
//       return;
//     }
//     if (!momForm.summary.trim()) {
//       toast.info("Please enter a summary.");
//       return;
//     }
//     if (!signatureFile) {
//       toast.info("Please upload a signature image.");
//       return;
//     }
//     if (isTimeExceeded && !isEditMode && (!reasonForDelay.trim() || !isAgreedToTerms)) {
//       toast.info("Please provide a reason for the delay and agree to the terms.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("agenda", momForm.agenda);
//       formData.append("meetingMode", momForm.meetingMode);
//       formData.append("duration", momForm.duration);
//       formData.append("participants", JSON.stringify(momForm.participants.split(",").map((p) => p.trim()).filter(Boolean)));
//       formData.append("summary", momForm.summary);
//       formData.append("notes", momForm.notes);
//       formData.append("createdBy", momForm.createdBy);
//       formData.append("meetingId", momForm.meetingId);
//       formData.append("submittedBy", currentUser?.name || momForm.createdBy);
//       if (signatureFile) {
//         formData.append("signature", signatureFile);
//       }
//       if (isTimeExceeded && !isEditMode) {
//         formData.append("reasonForDelay", reasonForDelay);
//       }

//       if (isTimeExceeded && !isEditMode) {
//         await dispatch(
//           submitCause({
//             meetingId: event?.extendedProps?.meetingId,
//             reason: reasonForDelay,
//             submittedBy: currentUser?.name || momForm.createdBy,
//           })
//         ).unwrap();
//         toast.success("Cause for delay submitted successfully!");
//       }

//       if (isEditMode && momByMeetingId) {
//         await dispatch(updateMoM(formData)).unwrap();
//         toast.success("MoM updated successfully!");
//       } else {
//         await dispatch(createMoM(formData)).unwrap();
//         toast.success("MoM created successfully!");
//       }
//       setMode("view");
//       setIsEditMode(false);
//       setReasonForDelay("");
//       setIsAgreedToTerms(false);
//       setSignatureFile(null);
//       setSignaturePreview(null);
//     } catch (error) {
//       toast.error(`Failed to ${isEditMode ? "update" : "create"} MoM: ${error?.message || "Unknown error"}`);
//     }
//   };

//   // Handler: Toggle mode
//   const handleToggleMode = () => {
//     if (mode === "view") {
//       setMode("form");
//       setIsEditMode(momByMeetingId ? true : false);
//     } else {
//       setMode("view");
//       setIsEditMode(false);
//       setReasonForDelay("");
//       setIsAgreedToTerms(false);
//       setSignatureFile(null);
//       setSignaturePreview(null);
//     }
//   };

//   // Handler: Close modal
//   const handleClose = () => {
//     dispatch(resetMoMByMeetingId());
//     onClose();
//   };

//   // Helper: Render participant with circled initial and email tooltip
//   const renderParticipant = (participant, index) => {
//     const initial = participant.charAt(0).toUpperCase();
//     return (
//       <div
//         key={index}
//         className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm cursor-pointer group"
//         title={participant}
//       >
//         {initial}
//         <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
//           {participant}
//         </span>
//       </div>
//     );
//   };

//   // If no event, render minimal modal with a message
//   if (!event) {
//     return (
//       <Dialog open={isOpen} onOpenChange={handleClose}>
//         <DialogContent className="w-full max-w-7xl md:w-[90vw] p-0 md:p-6 overflow-y-auto max-h-[90vh]">
//           <DialogHeader>
//             <DialogTitle className="text-xl">No Event Selected</DialogTitle>
//           </DialogHeader>
//           <div className="p-4 text-gray-700">No event data available.</div>
//           <div className="mt-6 flex justify-end">
//             <Button variant="outline" onClick={handleClose}>
//               Close
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // Loading state
//   if (momByMeetingIdLoading || momViewLoading) {
//     return (
//       <Dialog open={isOpen} onOpenChange={handleClose}>
//         <DialogContent className="w-full max-w-7xl md:w-[90vw] p-0 md:p-6 overflow-y-auto max-h-[90vh]">
//           <div className="min-h-[400px] flex items-center justify-center">
//             <div className="flex flex-col items-center gap-4">
//               <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
//               <span className="text-green-600 text-lg font-semibold">Loading...</span>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="w-full min-w-7xl md:min-w-[60vw] p-0 md:p-6 overflow-y-auto max-h-[90vh]">
//         <DialogHeader>
//           <div className="flex justify-between items-center">
//             <DialogTitle className="text-xl">
//               {event.title || "Event Details"}
//             </DialogTitle>
//             {mode === "view" && momByMeetingId && (
//               <button
//                 onClick={handleToggleMode}
//                 className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
//                 title="Edit MoM"
//               >
//                 <Edit2 className="h-5 w-5" />
//               </button>
//             )}
//           </div>
//         </DialogHeader>

//         {/* Warning Messages */}
//         {isTimeExceeded && (!momByMeetingId || !isWithinOneHour) && (
//           <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
//             <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
//             <span>
//               {!momByMeetingId
//                 ? isWithinOneHour
//                   ? "Please complete MoM within one hour of meeting end time."
//                   : "Meeting has ended, and no MoM has been created."
//                 : "Meeting has ended, and MoM creation is delayed beyond one hour."}
//             </span>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-w-6xl">
//           {/* LEFT: Details Section */}
//           <div className="space-y-3 text-sm text-gray-700">
//             <div>
//               <strong>Start:</strong> {new Date(event.start).toLocaleString()}
//             </div>
//             <div>
//               <strong>End:</strong> {new Date(event.end).toLocaleString()}
//             </div>
//             {event.extendedProps?.description && (
//               <div>
//                 <strong>Agenda:</strong> {event.extendedProps.description}
//               </div>
//             )}
//             {event.extendedProps?.location && (
//               <div>
//                 <strong>Location:</strong> {event.extendedProps.location}
//               </div>
//             )}
//             {event.extendedProps?.entryPoint && (
//               <div className="flex items-center gap-2">
//                 {event.extendedProps?.conferenceIcon && (
//                   <img
//                     src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
//                     alt="Google Meet"
//                     width={40}
//                     height={40}
//                     className="object-contain"
//                   />
//                 )}
//                 <a
//                   href={event.extendedProps.entryPoint}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   Join Google Meet
//                 </a>
//               </div>
//             )}
//             {event.extendedProps?.htmlLink && (
//               <div>
//                 <strong>Calendar Link:</strong>{" "}
//                 <a
//                   href={event.extendedProps.htmlLink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   Open in Google Calendar
//                 </a>
//               </div>
//             )}
//             {event.extendedProps?.organizer && (
//               <div>
//                 <strong>Organizer:</strong> {event.extendedProps.organizer}
//               </div>
//             )}
//             {event.extendedProps?.attendees?.length > 0 && (
//               <div>
//                 <strong>Attendees:</strong>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {event.extendedProps.attendees.map((a, i) => renderParticipant(a.email, i))}
//                 </div>
//               </div>
//             )}
//             {event.extendedProps?.timeZone && (
//               <div>
//                 <strong>Time Zone:</strong> {event.extendedProps.timeZone}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: MoM Form or View */}
//           <div className="bg-gray-50 border rounded-md p-4 h-full space-y-4">
//             {mode === "form" ? (
//               // Form View
//               <div className="space-y-4">
//                 <div>
//                   <Label className="text-green-600 font-semibold flex items-center">
//                     <FileText className="h-5 w-5 mr-2" />
//                     Summary
//                   </Label>
//                   <Textarea
//                     value={momForm.summary}
//                     onChange={(e) => handleMomFormChange(e, "summary")}
//                     placeholder="Enter meeting summary..."
//                     className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-sm"
//                     rows={4}
//                   />
//                 </div>
//                 <div>
//                   <Label className="text-green-600 font-semibold flex items-center">
//                     <FileText className="h-5 w-5 mr-2" />
//                     Notes
//                   </Label>
//                   <Textarea
//                     value={momForm.notes}
//                     onChange={(e) => handleMomFormChange(e, "notes")}
//                     placeholder="Enter additional notes..."
//                     className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-sm"
//                     rows={4}
//                   />
//                 </div>
//                 {isTimeExceeded && !isEditMode && (
//                   <>
//                     <div>
//                       <Label className="text-green-600 font-semibold flex items-center">
//                         <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
//                         Reason for Delay
//                       </Label>
//                       <Textarea
//                         value={reasonForDelay}
//                         onChange={handleReasonForDelayChange}
//                         placeholder="Enter reason for delay..."
//                         className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-sm"
//                         rows={3}
//                       />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="terms"
//                         checked={isAgreedToTerms}
//                         onCheckedChange={handleTermsChange}
//                         className="border-green-400 data-[state=checked]:bg-green-500"
//                       />
//                       <Label htmlFor="terms" className="text-green-600 font-semibold text-sm">
//                         I agree to the cause terms and conditions
//                       </Label>
//                     </div>
//                   </>
//                 )}
//                 <div>
//                   <Label className="text-green-600 font-semibold flex items-center">
//                     <Signature className="h-5 w-5 mr-2" />
//                     Signature (Image)
//                   </Label>
//                   <Input
//                     type="file"
//                     accept="image/png,image/jpeg,image/jpg"
//                     onChange={handleSignatureFileChange}
//                     className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-sm"
//                   />
//                   {signaturePreview && (
//                     <div className="mt-2">
//                       <Image
//                         src={signaturePreview}
//                         alt="Signature Preview"
//                         width={120}
//                         height={80}
//                         className="rounded-md border border-green-200"
//                       />
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-green-600 font-semibold flex items-center">
//                     <User className="h-5 w-5 mr-2" />
//                     Created By
//                   </Label>
//                   <Input
//                     value={momForm.createdBy}
//                     onChange={(e) => handleMomFormChange(e, "createdBy")}
//                     placeholder="Recorder's name..."
//                     className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-sm"
//                   />
//                 </div>
//                 <div className="flex justify-end gap-3">
//                   {isEditMode && (
//                     <Button
//                       variant="outline"
//                       className="border-green-500 text-green-600 hover:bg-green-100 rounded-lg text-sm"
//                       onClick={() => setMode("view")}
//                     >
//                       Cancel
//                     </Button>
//                   )}
//                   <Button
//                     className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
//                     onClick={handleSubmit}
//                     disabled={
//                       momByMeetingIdLoading ||
//                       (isTimeExceeded && !isEditMode && !areRequiredFieldsFilled())
//                     }
//                   >
//                     {momByMeetingIdLoading ? (
//                       <>
//                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                         Submitting...
//                       </>
//                     ) : isEditMode ? (
//                       "Update MoM"
//                     ) : (
//                       "Create MoM"
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               // View Mode: MoM Preview
//               <div className="space-y-4">
//                 {momByMeetingId && momView?.pdfUrl && (
//                   <div>
//                     <div className="w-full h-[300px] rounded-lg border border-green-200 overflow-hidden">
//                       <iframe
//                         src={momView.pdfUrl}
//                         width="100%"
//                         height="100%"
//                         className="rounded-lg"
//                         title="MoM PDF Preview"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

       
//      </DialogContent>
//     </Dialog>
//   );
// };

// export default ViewEventModal;










"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { format, isAfter, addHours } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMoMByMeetingId,
  resetMoMByMeetingId,
  createMoM,
  updateMoM,
  fetchMoMView,
} from "@/features/momSlice";
import { submitCause } from "@/features/causeSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Edit2,
  AlertCircle,
  Calendar,
  Users,
  Clock,
  FileText,
  Signature,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Image from "next/image";

const ViewEventModal = ({ isOpen, onClose, event }) => {
  const dispatch = useDispatch();
  const { momByMeetingId, momByMeetingIdLoading, momView, momViewLoading } = useSelector(
    (state) => state.mom
  );
  const [mode, setMode] = useState("view");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTimeExceeded, setIsTimeExceeded] = useState(false);
  const [isWithinOneHour, setIsWithinOneHour] = useState(false);
  const [reasonForDelay, setReasonForDelay] = useState("");
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const containerRef = useRef(null);
  const { currentUser } = useCurrentUser();

  // Form state for creating/editing MoM
  const [momForm, setMomForm] = useState({
    agenda: "",
    meetingMode: "Online",
    duration: "",
    participants: "",
    summary: "",
    notes: "",
    createdBy: currentUser?.name || "",
    meetingId: "",
  });

  // Helper: Format time (e.g., "10:00 AM")
  const formatTimes = (dateTime) => {
    if (!dateTime) return "";
    try {
      return format(new Date(dateTime), "p");
    } catch {
      return "";
    }
  };

  // Helper: Compute duration as "startTime - endTime"
  const getDurationString = useCallback(() => {
    if (!event) return "";
    const startTime = formatTimes(event.start);
    const endTime = formatTimes(event.end);
    return startTime && endTime ? `${startTime} - ${endTime}` : "";
  }, [event]);

  // Helper: Parse attendees into an array
  const getAttendeesArray = (attendees) => {
    if (!attendees) return [];
    if (Array.isArray(attendees)) {
      return attendees.map((a) => a.email);
    }
    return String(attendees).split(",").map((p) => p.trim()).filter(Boolean);
  };

  // Helper: Check meeting time status
  const checkMeetingTimeStatus = useCallback(() => {
    if (!event?.end) return { isTimeExceeded: false, isWithinOneHour: false };
    const endTime = new Date(event.end);
    const now = new Date();
    const oneHourAfterEnd = addHours(endTime, 1);
    return {
      isTimeExceeded: isAfter(now, endTime),
      isWithinOneHour: isAfter(now, endTime) && !isAfter(now, oneHourAfterEnd),
    };
  }, [event]);

  // Effect: Initialize form and check time status
  useEffect(() => {
    const { isTimeExceeded, isWithinOneHour } = checkMeetingTimeStatus();
    setIsTimeExceeded(isTimeExceeded);
    setIsWithinOneHour(isWithinOneHour);

    if (event && momByMeetingId && momByMeetingId.meetingId === event.extendedProps?.meetingId) {
      setMomForm({
        agenda: momByMeetingId.agenda || event.extendedProps?.description || "",
        meetingMode: momByMeetingId.meetingMode || (event.extendedProps?.location ? (event.extendedProps.location.includes("http") ? "Online" : "In-Person") : "Online"),
        duration: momByMeetingId.duration || getDurationString() || "",
        participants: Array.isArray(momByMeetingId.participants)
          ? momByMeetingId.participants.join(", ")
          : momByMeetingId.participants || getAttendeesArray(event.extendedProps?.attendees).join(", ") || "",
        summary: momByMeetingId.summary || "",
        notes: momByMeetingId.notes || "",
        createdBy: momByMeetingId.createdBy || currentUser?.name || "",
        meetingId: event.extendedProps?.meetingId || "",
      });
      setMode("view");
      setIsEditMode(false);
    } else if (event) {
      setMomForm({
        agenda: event.extendedProps?.description || "",
        meetingMode: event.extendedProps?.location ? (event.extendedProps.location.includes("http") ? "Online" : "In-Person") : "Online",
        duration: getDurationString() || "",
        participants: getAttendeesArray(event.extendedProps?.attendees).join(", ") || "",
        summary: "",
        notes: "",
        createdBy: currentUser?.name || "",
        meetingId: event.extendedProps?.meetingId || "",
      });
      setMode("form");
      setIsEditMode(false);
    }

    setReasonForDelay(momByMeetingId?.reasonForDelay || "");
    setIsAgreedToTerms(false);
    setSignatureFile(null);
    setSignaturePreview(null);
  }, [momByMeetingId, event, checkMeetingTimeStatus, getDurationString, currentUser?.name]);

  // Effect: Fetch MoM data when modal opens
  useEffect(() => {
    if (isOpen && event?.extendedProps?.meetingId) {
      dispatch(fetchMoMByMeetingId(event.extendedProps.meetingId));
    }
  }, [isOpen, event, dispatch]);

  // Effect: Fetch MoM view when available
  useEffect(() => {
    if (isOpen && momByMeetingId?.momId && mode === "view") {
      dispatch(fetchMoMView(momByMeetingId.momId));
    }
  }, [isOpen, momByMeetingId?.momId, mode, dispatch]);

  // Effect: Clean up blob URL and reset state
  useEffect(() => {
    return () => {
      if (momView?.pdfUrl) {
        URL.revokeObjectURL(momView.pdfUrl);
      }
      if (signaturePreview) {
        URL.revokeObjectURL(signaturePreview);
      }
      if (!isOpen) {
        dispatch(resetMoMByMeetingId());
      }
    };
  }, [isOpen, momView?.pdfUrl, signaturePreview, dispatch]);

  // Handler: Form input changes
  const handleMomFormChange = (e, field) => {
    setMomForm({ ...momForm, [field]: e.target.value });
  };

  // Handler: Reason for delay change
  const handleReasonForDelayChange = (e) => {
    setReasonForDelay(e.target.value);
  };

  // Handler: Signature file change
  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setSignatureFile(file);
      setSignaturePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file (.png, .jpg, .jpeg).");
      setSignatureFile(null);
      setSignaturePreview(null);
    }
  };

  // Handler: Terms agreement checkbox
  const handleTermsChange = (checked) => {
    setIsAgreedToTerms(checked);
  };

  // Helper: Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return (
      momForm.createdBy.trim() &&
      momForm.summary.trim() &&
      signatureFile &&
      (!isTimeExceeded || (reasonForDelay.trim() && isAgreedToTerms))
    );
  };

  // Handler: Form submission
  const handleSubmit = async () => {
    if (!momForm.createdBy.trim()) {
      toast.info("Please enter the name of the person who created the MoM.");
      return;
    }
    if (!momForm.summary.trim()) {
      toast.info("Please enter a summary.");
      return;
    }
    if (!signatureFile) {
      toast.info("Please upload a signature image.");
      return;
    }
    if (isTimeExceeded && !isEditMode && (!reasonForDelay.trim() || !isAgreedToTerms)) {
      toast.info("Please provide a reason for the delay and agree to the terms.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("agenda", momForm.agenda);
      formData.append("meetingMode", momForm.meetingMode);
      formData.append("duration", momForm.duration);
      formData.append("participants", JSON.stringify(momForm.participants.split(",").map((p) => p.trim()).filter(Boolean)));
      formData.append("summary", momForm.summary);
      formData.append("notes", momForm.notes);
      formData.append("createdBy", momForm.createdBy);
      formData.append("meetingId", momForm.meetingId);
      formData.append("submittedBy", currentUser?.name || momForm.createdBy);
      if (signatureFile) {
        formData.append("signature", signatureFile);
      }
      if (isTimeExceeded && !isEditMode) {
        formData.append("reasonForDelay", reasonForDelay);
      }

      if (isTimeExceeded && !isEditMode) {
        if (!event?.extendedProps?.meetingId || !reasonForDelay || !currentUser?.name) {
          toast.error("meetingId, reason, and submittedBy are required.");
          return;
        }
        await dispatch(
          submitCause({
            meetingId: event.extendedProps.meetingId,
            reason: reasonForDelay,
            submittedBy: currentUser?.name || momForm.createdBy,
          })
        ).unwrap();
        toast.success("Cause for delay submitted successfully!");
      }

      if (isEditMode && momByMeetingId) {
        await dispatch(updateMoM(formData)).unwrap();
        toast.success("MoM updated successfully!");
      } else {
        await dispatch(createMoM(formData)).unwrap();
        toast.success("MoM created successfully!");
      }
      setMode("view");
      setIsEditMode(false);
      setReasonForDelay("");
      setIsAgreedToTerms(false);
      setSignatureFile(null);
      setSignaturePreview(null);
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} MoM: ${error?.message || "Unknown error"}`);
    }
  };

  // Handler: Toggle mode
  const handleToggleMode = () => {
    if (mode === "view") {
      setMode("form");
      setIsEditMode(momByMeetingId ? true : false);
    } else {
      setMode("view");
      setIsEditMode(false);
      setReasonForDelay("");
      setIsAgreedToTerms(false);
      setSignatureFile(null);
      setSignaturePreview(null);
    }
  };

  // Handler: Close modal
  const handleClose = () => {
    dispatch(resetMoMByMeetingId());
    onClose();
  };

  // Helper: Render participant with circled initial and email tooltip
  const renderParticipant = (participant, index) => {
    const initial = participant.charAt(0).toUpperCase();
    return (
      <div
        key={index}
        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm cursor-pointer group"
        title={participant}
      >
        {initial}
        <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
          {participant}
        </span>
      </div>
    );
  };

  // If no event, render minimal modal with a message
  if (!event) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">No Event Selected</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-gray-700 text-sm sm:text-base">No event data available.</div>
          <div className="mt-4 sm:mt-6 flex justify-end">
            <Button variant="outline" onClick={handleClose} className="text-sm sm:text-base">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Loading state
  if (momByMeetingIdLoading || momViewLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 animate-spin" />
              <span className="text-green-600 text-base sm:text-lg font-semibold">Loading...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl">
              {event.title || "Event Details"}
            </DialogTitle>
            {mode === "view" && momByMeetingId && (
              <button
                onClick={handleToggleMode}
                className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                title="Edit MoM"
              >
                <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Warning Messages */}
        {isTimeExceeded && (!momByMeetingId || !isWithinOneHour) && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            <span>
              {!momByMeetingId
                ? isWithinOneHour
                  ? "Please complete MoM within one hour of meeting end time."
                  : "Meeting has ended, and no MoM has been created."
                : "Meeting has ended, and MoM creation is delayed beyond one hour."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
          {/* LEFT: Details Section */}
          <div className="space-y-3 text-xs sm:text-sm text-gray-700">
            <div>
              <strong>Start:</strong> {new Date(event.start).toLocaleString()}
            </div>
            <div>
              <strong>End:</strong> {new Date(event.end).toLocaleString()}
            </div>
            {event.extendedProps?.description && (
              <div>
                <strong>Agenda:</strong> {event.extendedProps.description}
              </div>
            )}
            {event.extendedProps?.location && (
              <div>
                <strong>Location:</strong> {event.extendedProps.location}
              </div>
            )}
            {event.extendedProps?.entryPoint && (
              <div className="flex items-center gap-2">
                {event.extendedProps?.conferenceIcon && (
                  <Image
                    src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
                    alt="Google Meet"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                )}
                <a
                  href={event.extendedProps.entryPoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs sm:text-sm"
                >
                  Join Google Meet
                </a>
              </div>
            )}
            {event.extendedProps?.htmlLink && (
              <div>
                <strong>Calendar Link:</strong>{" "}
                <a
                  href={event.extendedProps.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs sm:text-sm"
                >
                  Open in Google Calendar
                </a>
              </div>
            )}
            {event.extendedProps?.organizer && (
              <div>
                <strong>Organizer:</strong> {event.extendedProps.organizer}
              </div>
            )}
            {event.extendedProps?.attendees?.length > 0 && (
              <div>
                <strong>Attendees:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.extendedProps.attendees.map((a, i) => renderParticipant(a.email, i))}
                </div>
              </div>
            )}
            {event.extendedProps?.timeZone && (
              <div>
                <strong>Time Zone:</strong> {event.extendedProps.timeZone}
              </div>
            )}
          </div>

          {/* RIGHT: MoM Form or View */}
          <div className="bg-gray-50 border rounded-md p-3 sm:p-4 space-y-4">
            {mode === "form" ? (
              // Form View
              <div className="space-y-4">
                <div>
                  <Label className="text-green-600 font-semibold flex items-center text-xs sm:text-sm">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Summary
                  </Label>
                  <Textarea
                    value={momForm.summary}
                    onChange={(e) => handleMomFormChange(e, "summary")}
                    placeholder="Enter meeting summary..."
                    className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-xs sm:text-sm"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-green-600 font-semibold flex items-center text-xs sm:text-sm">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Notes
                  </Label>
                  <Textarea
                    value={momForm.notes}
                    onChange={(e) => handleMomFormChange(e, "notes")}
                    placeholder="Enter additional notes..."
                    className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-xs sm:text-sm"
                    rows={4}
                  />
                </div>
                {isTimeExceeded && !isEditMode && (
                  <>
                    <div>
                      <Label className="text-green-600 font-semibold flex items-center text-xs sm:text-sm">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                        Reason for Delay
                      </Label>
                      <Textarea
                        value={reasonForDelay}
                        onChange={handleReasonForDelayChange}
                        placeholder="Enter reason for delay..."
                        className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-xs sm:text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={isAgreedToTerms}
                        onCheckedChange={handleTermsChange}
                        className="border-green-400 data-[state=checked]:bg-green-500"
                      />
                      <Label htmlFor="terms" className="text-green-600 font-semibold text-xs sm:text-sm">
                        I agree to the cause terms and conditions
                      </Label>
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-green-600 font-semibold flex items-center text-xs sm:text-sm">
                    <Signature className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Signature (Image)
                  </Label>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleSignatureFileChange}
                    className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-xs sm:text-sm"
                  />
                  {signaturePreview && (
                    <div className="mt-2">
                      <Image
                        src={signaturePreview}
                        alt="Signature Preview"
                        width={100}
                        height={60}
                        className="rounded-md border border-green-200"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-green-600 font-semibold flex items-center text-xs sm:text-sm">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Created By
                  </Label>
                  <Input
                    value={momForm.createdBy}
                    onChange={(e) => handleMomFormChange(e, "createdBy")}
                    placeholder="Recorder's name..."
                    className="mt-1 border-green-200 focus:ring-1 focus:ring-green-500 bg-green-50/50 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 sm:gap-3">
                  {isEditMode && (
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-100 rounded-lg text-xs sm:text-sm"
                      onClick={() => setMode("view")}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm"
                    onClick={handleSubmit}
                    disabled={
                      momByMeetingIdLoading ||
                      (isTimeExceeded && !isEditMode && !areRequiredFieldsFilled())
                    }
                  >
                    {momByMeetingIdLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : isEditMode ? (
                      "Update MoM"
                    ) : (
                      "Create MoM"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode: MoM Preview
              <div className="space-y-4">
                {momByMeetingId && momView?.pdfUrl && (
                  <div>
                    <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-lg border border-green-200 overflow-hidden">
                      <iframe
                        src={momView.pdfUrl}
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                        title="MoM PDF Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <Button variant="outline" onClick={handleClose} className="text-xs sm:text-sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventModal;