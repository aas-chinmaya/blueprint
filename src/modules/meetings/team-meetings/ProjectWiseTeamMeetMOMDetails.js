
// "use client";

// import { useEffect, useState, useRef, useMemo } from "react";
// import { format, isAfter, addHours } from "date-fns";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchMoMByMeetingId,
//   resetMoMByMeetingId,
//   updateMoM,
//   fetchMoMView,
// } from "@/features/momSlice";
// import { submitCause } from "@/features/causeSlice";
// import { createProjectMoM } from "@/features/projectmomSlice";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Loader2, Edit2, AlertCircle, FileText, Users, Clock, Signature, User } from "lucide-react";
// import { toast } from "sonner";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import Image from "next/image";

// const TIME_ZONE = "Asia/Kolkata";

// // Error Boundary Component
// function ErrorBoundary({ children }) {
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const errorHandler = (e) => {
//       console.error("ErrorBoundary caught:", e);
//       setError(e.message || "An unexpected error occurred");
//     };
//     window.addEventListener("error", errorHandler);
//     return () => window.removeEventListener("error", errorHandler);
//   }, []);

//   if (error) {
//     return (
//       <div className="min-h-[400px] bg-background rounded-xl flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4 text-destructive">
//           <AlertCircle className="h-12 w-12" />
//           <span className="text-lg font-semibold">Error: {error}</span>
//           <Button
//             variant="outline"
//             onClick={() => window.location.reload()}
//             className="border-primary text-primary hover:bg-primary/10"
//           >
//             Reload
//           </Button>
//         </div>
//       </div>
//     );
//   }
//   return children;
// }

// function ProjectWiseTeamMeetMOMDetails({ project, meeting, onClose }) {
//   const dispatch = useDispatch();
//   const { momByMeetingId, momByMeetingIdLoading, momView, momViewLoading, error, momViewError } = useSelector(
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
//   const { currentUser } = useCurrentUser();
//   const prevMeetingIdRef = useRef(null);

//   // Memoize adaptedMeeting to prevent new object references
//   const adaptedMeeting = useMemo(
//     () => ({
//       meetingId: meeting?.eventId || "",
//       agenda: meeting?.summary || "",
//       meetingMode: meeting?.conferenceData?.conferenceSolution?.name || "Online",
//       start: meeting?.start?.dateTime || meeting?.start || "",
//       end: meeting?.end?.dateTime || meeting?.end || "",
//       attendees: meeting?.attendees?.map((a) => a.email) || [],
//     }),
//     [
//       meeting?.eventId,
//       meeting?.summary,
//       meeting?.conferenceData?.conferenceSolution?.name,
//       meeting?.start,
//       meeting?.end,
//       meeting?.attendees,
//     ]
//   );

//   // Form state for creating/editing MoM
//   const [momForm, setMomForm] = useState({
//     agenda: adaptedMeeting.agenda || "",
//     meetingMode: adaptedMeeting.meetingMode || "Online",
//     duration: "",
//     participants: "",
//     summary: "",
//     notes: "",
//     createdBy: currentUser?.name || "",
//     meetingId: adaptedMeeting.meetingId || "",
//     projectName: project?.projectName || "",
//     status: "draft",
//   });

//   // Helper: Format time (e.g., "8:34 PM")
//   const formatTimes = (dateTime) => {
//     if (!dateTime) return "";
//     try {
//       return format(new Date(dateTime), "p", { timeZone: TIME_ZONE });
//     } catch {
//       return "";
//     }
//   };

//   // Helper: Compute duration as "startTime - endTime"
//   const getDurationString = () => {
//     const start = formatTimes(adaptedMeeting.start);
//     const end = formatTimes(adaptedMeeting.end);
//     return start && end ? `${start} - ${end}` : "";
//   };

//   // Helper: Parse attendees into an array
//   const getAttendeesArray = (attendees) => {
//     if (Array.isArray(attendees)) {
//       return attendees;
//     }
//     return attendees ? String(attendees).split(",").map((p) => p.trim()).filter(Boolean) : [];
//   };

//   // Helper: Check meeting time status
//   const checkMeetingTimeStatus = () => {
//     if (!adaptedMeeting.end) return { isTimeExceeded: false, isWithinOneHour: false };
//     const endTime = new Date(adaptedMeeting.end);
//     const now = new Date();
//     const oneHourAfterEnd = addHours(endTime, 1);
//     return {
//       isTimeExceeded: isAfter(now, endTime),
//       isWithinOneHour: isAfter(now, endTime) && !isAfter(now, oneHourAfterEnd),
//     };
//   };

//   // Effect: Initialize form and check time status
//   useEffect(() => {
//     const { isTimeExceeded, isWithinOneHour } = checkMeetingTimeStatus();
//     setIsTimeExceeded(isTimeExceeded);
//     setIsWithinOneHour(isWithinOneHour);

//     const participants = getAttendeesArray(adaptedMeeting.attendees).join(", ");

//     if (momByMeetingId && momByMeetingId.meetingId === adaptedMeeting.meetingId) {
//       setMomForm({
//         agenda: momByMeetingId.agenda || adaptedMeeting.agenda || "",
//         meetingMode: momByMeetingId.meetingMode || adaptedMeeting.meetingMode || "Online",
//         duration: momByMeetingId.duration || getDurationString() || "",
//         participants: Array.isArray(momByMeetingId.participants)
//           ? momByMeetingId.participants.join(", ")
//           : momByMeetingId.participants || participants || "",
//         summary: momByMeetingId.summary || "",
//         notes: momByMeetingId.notes || "",
//         createdBy: momByMeetingId.createdBy || currentUser?.name || "",
//         meetingId: adaptedMeeting.meetingId || "",
//         projectName: momByMeetingId.projectName || project?.projectName || "",
//         status: momByMeetingId.status || "draft",
//       });
//       setMode("view");
//       setIsEditMode(false);
//     } else {
//       setMomForm({
//         agenda: adaptedMeeting.agenda || "",
//         meetingMode: adaptedMeeting.meetingMode || "Online",
//         duration: getDurationString() || "",
//         participants: participants || "",
//         summary: "",
//         notes: "",
//         createdBy: currentUser?.name || "",
//         meetingId: adaptedMeeting.meetingId || "",
//         projectName: project?.projectName || "",
//         status: "draft",
//       });
//       setMode("form");
//       setIsEditMode(false);
//     }

//     setReasonForDelay(momByMeetingId?.reasonForDelay || "");
//     setIsAgreedToTerms(false);
//     setSignatureFile(null);
//     setSignaturePreview(null);
//   }, [momByMeetingId, adaptedMeeting, currentUser?.name, project?.projectName,checkMeetingTimeStatus,getDurationString]);

//   // Effect: Fetch MoM data when dialog opens
//   useEffect(() => {
//     if (adaptedMeeting.meetingId && adaptedMeeting.meetingId !== prevMeetingIdRef.current && !momByMeetingIdLoading) {
//       prevMeetingIdRef.current = adaptedMeeting.meetingId;
//       dispatch(fetchMoMByMeetingId(adaptedMeeting.meetingId));
//     }
//   }, [adaptedMeeting.meetingId, dispatch, momByMeetingIdLoading]);

//   // Effect: Fetch MoM view when available
//   useEffect(() => {
//     if (momByMeetingId?.momId && mode === "view"  && !momView?.pdfUrl) {
//       // console.log("Dispatching fetchMoMView for momId:", momByMeetingId.momId);
//       dispatch(fetchMoMView(momByMeetingId.momId));
//     }
//   }, [momByMeetingId?.momId, mode, momView?.pdfUrl,dispatch]);
//   // }, [momByMeetingId?.momId, mode, momViewLoading, momView?.pdfUrl, dispatch]);

//   // Effect: Clean up blob URLs and reset state
//   useEffect(() => {
//     return () => {
//       if (momView?.pdfUrl) {
//         URL.revokeObjectURL(momView.pdfUrl);
//       }
//       if (signaturePreview) {
//         URL.revokeObjectURL(signaturePreview);
//       }
//       dispatch(resetMoMByMeetingId());
//     };
//   }, );

//   // Handler: Form input changes
//   const handleMomFormChange = (e, field) => {
//     try {
//       setMomForm((prev) => ({ ...prev, [field]: e.target.value }));
//     } catch (error) {
//       // console.error("Error updating form:", error);
//       toast.error("Failed to update form input. Please try again.");
//     }
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
//   const areRequiredFieldsFilled = (status = "draft") => {
//     const baseFields = momForm.createdBy.trim() && momForm.summary.trim() && momForm.projectName.trim();
//     if (status === "final") {
//       return baseFields && signatureFile && (!isTimeExceeded || (reasonForDelay.trim() && isAgreedToTerms));
//     }
//     return baseFields;
//   };

//   // Handler: Form submission
//   const handleSubmit = async (status) => {
//     if (!momForm.createdBy.trim()) {
//       toast.info("Please enter the name of the person who created the MoM.");
//       return;
//     }
//     if (!momForm.summary.trim()) {
//       toast.info("Please enter a summary.");
//       return;
//     }
//     if (!momForm.projectName.trim()) {
//       toast.info("Project name is required.");
//       return;
//     }
//     if (status === "final" && !signatureFile) {
//       toast.info("Please upload a signature image.");
//       return;
//     }
//     if (status === "final" && isTimeExceeded && !isEditMode && (!reasonForDelay.trim() || !isAgreedToTerms)) {
//       toast.info("Please provide a reason for the delay and agree to the terms.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("agenda", momForm.agenda);
//       formData.append("meetingMode", momForm.meetingMode);
//       formData.append("duration", momForm.duration);
//       const participantsArray = momForm.participants.split(",").map((p) => p.trim()).filter(Boolean);
//       formData.append("participants", JSON.stringify(participantsArray));
//       formData.append("summary", momForm.summary);
//       formData.append("notes", momForm.notes);
//       formData.append("createdBy", momForm.createdBy);
//       formData.append("meetingId", momForm.meetingId);
//       formData.append("projectName", momForm.projectName);
//       formData.append("status", status);
//       if (signatureFile) {
//         formData.append("signature", signatureFile);
//       }
//       if (status === "final" && isTimeExceeded && !isEditMode) {
//         formData.append("reasonForDelay", reasonForDelay);
//       }

    

//       let createMoMSuccess = false;

//       if (isEditMode && momByMeetingId) {
//         await dispatch(updateMoM(formData)).unwrap();
//         toast.success(`MoM ${status === "draft" ? "updated as draft" : "finalized"} successfully!`);
//       } else {
//         const createMoMResult = await dispatch(createProjectMoM(formData)).unwrap();
//         createMoMSuccess = !!createMoMResult;
//         toast.success(`MoM ${status === "draft" ? "saved as draft" : "created"} successfully!`);
//       }

//       if (createMoMSuccess && status === "final" && isTimeExceeded && !isEditMode) {
//         await dispatch(
//           submitCause({
//             meetingId: adaptedMeeting.meetingId,
//             reason: reasonForDelay,
//             submittedBy: currentUser?.name || momForm.createdBy,
//           })
//         ).unwrap();
//         toast.success("Cause for delay submitted successfully!");
//       }

//       setMode("view");
//       setIsEditMode(false);
//       setReasonForDelay("");
//       setIsAgreedToTerms(false);
//       setSignatureFile(null);
//       setSignaturePreview(null);
//     } catch (error) {
//       // console.error("Submission error:", error);
//       toast.error(`Failed to ${isEditMode ? "update" : "create"} MoM: ${error.message || "Unknown error"}`);
//     }
//   };

//   // Handler: Toggle mode
//   const handleToggleMode = () => {
//     if (mode === "view") {
//       setMode("form");
//       setIsEditMode(!!momByMeetingId);
//     } else {
//       setMode("view");
//       setIsEditMode(false);
//       setReasonForDelay("");
//       setIsAgreedToTerms(false);
//       setSignatureFile(null);
//       setSignaturePreview(null);
//     }
//   };

//   // Helper: Render participant with circled initial and email tooltip
//   const renderParticipant = (participant, index) => {
//     const initial = participant.charAt(0).toUpperCase();
//     return (
//       <div
//         key={index}
//         className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success font-semibold text-sm cursor-pointer group"
//         title={participant}
//       >
//         {initial}
//         <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-muted-foreground text-background text-xs rounded py-1 px-2 z-10">
//           {participant}
//         </span>
//       </div>
//     );
//   };

//   return (
//     <ErrorBoundary>
//       <div className="w-full p-4 sm:p-6 bg-background rounded-xl">
       

//         {momByMeetingIdLoading ? (
//           <div className="min-h-[400px] bg-background rounded-xl flex items-center justify-center">
//             <div className="flex flex-col items-center gap-4">
//               <Loader2 className="h-12 w-12 text-primary animate-spin" />
//               <span className="text-primary text-lg font-semibold">Loading...</span>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//               <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center">
//                 <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
//                 {mode === "form" ? (isEditMode ? "Edit Minutes of Meeting" : "Create Minutes of Meeting") : "Meeting Details"}
//               </h2>
//               {mode === "view" && momByMeetingId && (
//                 <Button
//                   variant="ghost"
//                   onClick={handleToggleMode}
//                   className="text-primary hover:bg-primary/10"
//                   aria-label="Edit MoM"
//                 >
//                   <Edit2 className="h-5 w-5" />
//                 </Button>
//               )}
//             </div>

//             {isTimeExceeded && (!momByMeetingId || !isWithinOneHour) && (
//               <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center text-sm">
//                 <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
//                 <span>
//                   {!momByMeetingId
//                     ? isWithinOneHour
//                       ? "Please complete MoM within one hour of meeting end time."
//                       : "Meeting has ended, and no MoM has been created."
//                     : "Meeting has ended, and MoM creation is delayed beyond one hour."}
//                 </span>
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div>
//                   <Label className="text-primary font-semibold flex items-center">
//                     <FileText className="h-5 w-5 mr-2" />
//                     Project Name
//                   </Label>
//                   <p className="text-foreground text-sm sm:text-base">{project?.projectName || "N/A"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-primary font-semibold flex items-center">
//                     <FileText className="h-5 w-5 mr-2" />
//                     Agenda
//                   </Label>
//                   <p className="text-foreground text-sm sm:text-base">{adaptedMeeting.agenda || "N/A"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-primary font-semibold flex items-center">
//                     <Users className="h-5 w-5 mr-2" />
//                     Meeting Mode
//                   </Label>
//                   <p className="text-foreground text-sm sm:text-base">{adaptedMeeting.meetingMode || "Online"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-primary font-semibold flex items-center">
//                     <Clock className="h-5 w-5 mr-2" />
//                     Duration
//                   </Label>
//                   <p className="text-foreground text-sm sm:text-base">{getDurationString() || "N/A"}</p>
//                 </div>
//                 <div>
//                   <Label className="text-primary font-semibold flex items-center">
//                     <Users className="h-5 w-5 mr-2" />
//                     Participants
//                   </Label>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {getAttendeesArray(adaptedMeeting.attendees).length > 0 ? (
//                       getAttendeesArray(adaptedMeeting.attendees).map((participant, index) =>
//                         renderParticipant(participant, index)
//                       )
//                     ) : (
//                       <p className="text-foreground text-sm sm:text-base">N/A</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {mode === "form" ? (
//                   <div className="space-y-4">
//                     <div>
//                       <Label className="text-primary font-semibold flex items-center">
//                         <FileText className="h-5 w-5 mr-2" />
//                         Summary
//                       </Label>
//                       <Textarea
//                         value={momForm.summary}
//                         onChange={(e) => handleMomFormChange(e, "summary")}
//                         placeholder="Enter meeting summary..."
//                         className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
//                         rows={4}
//                       />
//                     </div>
//                     <div>
//                       <Label className="text-primary font-semibold flex items-center">
//                         <FileText className="h-5 w-5 mr-2" />
//                         Notes
//                       </Label>
//                       <Textarea
//                         value={momForm.notes}
//                         onChange={(e) => handleMomFormChange(e, "notes")}
//                         placeholder="Enter additional notes..."
//                         className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
//                         rows={4}
//                       />
//                     </div>
                    
//                     {isTimeExceeded && !isEditMode && (
//                       <>
//                         <div>
//                           <Label className="text-primary font-semibold flex items-center">
//                             <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
//                             Reason for Delay
//                           </Label>
//                           <Textarea
//                             value={reasonForDelay}
//                             onChange={handleReasonForDelayChange}
//                             placeholder="Enter reason for delay..."
//                             className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
//                             rows={3}
//                           />
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Checkbox
//                             id="terms"
//                             checked={isAgreedToTerms}
//                             onCheckedChange={handleTermsChange}
//                             className="border-border data-[state=checked]:bg-primary"
//                           />
//                           <Label htmlFor="terms" className="text-primary font-semibold text-sm sm:text-base">
//                             I agree to the cause terms and conditions
//                           </Label>
//                         </div>
//                       </>
//                     )}
//                     <div>
//                       <Label className="text-primary font-semibold flex items-center">
//                         <Signature className="h-5 w-5 mr-2" />
//                         Signature (Image)
//                       </Label>
//                       <Input
//                         type="file"
//                         accept="image/png,image/jpeg,image/jpg"
//                         onChange={handleSignatureFileChange}
//                         className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
//                       />
//                       {signaturePreview && (
//                         <div className="mt-2">
//                           <Image
//                             src={signaturePreview}
//                             alt="Signature Preview"
//                             width={120}
//                             height={80}
//                             className="rounded-md border border-border"
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <Label className="text-primary font-semibold flex items-center">
//                         <User className="h-5 w-5 mr-2" />
//                         Created By
//                       </Label>
//                       <Input
//                         value={momForm.createdBy}
//                         onChange={(e) => handleMomFormChange(e, "createdBy")}
//                         placeholder="Recorder's name..."
//                         className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       {isEditMode && (
//                         <Button
//                           variant="outline"
//                           className="border-primary text-primary hover:bg-primary/10 rounded-lg text-sm sm:text-base"
//                           onClick={() => setMode("view")}
//                           aria-label="Cancel MoM editing"
//                         >
//                           Cancel
//                         </Button>
//                       )}
//                       <Button
//                         variant="outline"
//                         className="border-primary text-primary hover:bg-primary/10 rounded-lg text-sm sm:text-base"
//                         onClick={() => handleSubmit("draft")}
//                         disabled={momByMeetingIdLoading || !areRequiredFieldsFilled("draft")}
//                         aria-label="Save MoM as draft"
//                       >
//                         {momByMeetingIdLoading ? (
//                           <>
//                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                             Saving...
//                           </>
//                         ) : (
//                           "Save as Draft"
//                         )}
//                       </Button>
//                       <Button
//                         variant="default"
//                         className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm sm:text-base"
//                         onClick={() => handleSubmit("final")}
//                         disabled={momByMeetingIdLoading || !areRequiredFieldsFilled("final")}
//                         aria-label={isEditMode ? "Finalize MoM" : "Create MoM"}
//                       >
//                         {momByMeetingIdLoading ? (
//                           <>
//                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                             Submitting...
//                           </>
//                         ) : isEditMode ? (
//                           "Finalize MoM"
//                         ) : (
//                           "Create MoM"
//                         )}
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {momByMeetingId && (
//                       <div>
//                         {momView?.pdfUrl ? (
//                           <div>
//                             <div className="w-full h-[300px] sm:h-[400px] rounded-lg border border-border overflow-hidden">
//                               <iframe
//                                 src={momView.pdfUrl}
//                                 width="100%"
//                                 height="100%"
//                                 className="rounded-lg"
//                                 title="MoM PDF Preview"
//                                 type="application/pdf"
//                                 onError={(e) => console.error("Iframe error:", e)}
//                               />
//                             </div>
//                                                         <button
//                                 onClick={() => {
//                                   const link = document.createElement('a');
//                                   link.href = momView.pdfUrl;
//                                   link.download = `MoM_${momByMeetingId.meetingId}.pdf`;
//                                   link.click();
//                                 }}
//                                 className="mt-2 bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
//                               >
//                                 Download PDF
//                               </button>

//                           </div>
//                         ) 
//                         : (
//                           <div className="p-3 bg-muted text-muted-foreground rounded-lg flex items-center text-sm">
//                             <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
//                             <span>No PDF available for this MoM.</span>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

      
//           </>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// }

// export default ProjectWiseTeamMeetMOMDetails;












"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { format, isAfter, addHours } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMoMByMeetingId,
  resetMoMByMeetingId,
  updateMoM,
  fetchMoMView,
} from "@/features/momSlice";
import { submitCause } from "@/features/causeSlice";
import { createProjectMoM } from "@/features/projectmomSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Edit2, AlertCircle, FileText, Users, Clock, Signature, User } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Image from "next/image";

const TIME_ZONE = "Asia/Kolkata";

// Error Boundary Component
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (e) => {
      console.error("ErrorBoundary caught:", e);
      setError(e.message || "An unexpected error occurred");
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (error) {
    return (
      <div className="min-h-[400px] bg-background rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <span className="text-lg font-semibold">Error: {error}</span>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Reload
          </Button>
        </div>
      </div>
    );
  }
  return children;
}

function ProjectWiseTeamMeetMOMDetails({ project, meeting, onClose }) {
  const dispatch = useDispatch();
  const { momByMeetingId, momByMeetingIdLoading, momView, momViewLoading, error, momViewError } = useSelector(
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
  const { currentUser } = useCurrentUser();
  const prevMeetingIdRef = useRef(null);

  // Memoize adaptedMeeting to prevent new object references
  const adaptedMeeting = useMemo(
    () => ({
      meetingId: meeting?.eventId || "",
      agenda: meeting?.summary || "",
      meetingMode: meeting?.conferenceData?.conferenceSolution?.name || "Online",
      start: meeting?.start?.dateTime || meeting?.start || "",
      end: meeting?.end?.dateTime || meeting?.end || "",
      attendees: meeting?.attendees?.map((a) => a.email) || [],
    }),
    [
      meeting?.eventId,
      meeting?.summary,
      meeting?.conferenceData?.conferenceSolution?.name,
      meeting?.start,
      meeting?.end,
      meeting?.attendees,
    ]
  );

  // Form state for creating/editing MoM
  const [momForm, setMomForm] = useState({
    agenda: adaptedMeeting.agenda || "",
    meetingMode: adaptedMeeting.meetingMode || "Online",
    duration: "",
    participants: "",
    summary: "",
    notes: "",
    createdBy: currentUser?.name || "",
    meetingId: adaptedMeeting.meetingId || "",
    projectName: project?.projectName || "",
    status: "draft",
  });

  // Helper: Format time (e.g., "8:34 PM")
  const formatTimes = (dateTime) => {
    if (!dateTime) return "";
    try {
      return format(new Date(dateTime), "p", { timeZone: TIME_ZONE });
    } catch {
      return "";
    }
  };

  // Helper: Compute duration as "startTime - endTime"
  const getDurationString = useCallback(() => {
    const start = formatTimes(adaptedMeeting.start);
    const end = formatTimes(adaptedMeeting.end);
    return start && end ? `${start} - ${end}` : "";
  }, [adaptedMeeting.start, adaptedMeeting.end]);

  // Helper: Parse attendees into an array
  const getAttendeesArray = (attendees) => {
    if (Array.isArray(attendees)) {
      return attendees;
    }
    return attendees ? String(attendees).split(",").map((p) => p.trim()).filter(Boolean) : [];
  };

  // Helper: Check meeting time status
  const checkMeetingTimeStatus = useCallback(() => {
    if (!adaptedMeeting.end) return { isTimeExceeded: false, isWithinOneHour: false };
    const endTime = new Date(adaptedMeeting.end);
    const now = new Date();
    const oneHourAfterEnd = addHours(endTime, 1);
    return {
      isTimeExceeded: isAfter(now, endTime),
      isWithinOneHour: isAfter(now, endTime) && !isAfter(now, oneHourAfterEnd),
    };
  }, [adaptedMeeting.end]);

  // Effect: Initialize form and check time status
  useEffect(() => {
    const { isTimeExceeded, isWithinOneHour } = checkMeetingTimeStatus();
    setIsTimeExceeded(isTimeExceeded);
    setIsWithinOneHour(isWithinOneHour);

    const participants = getAttendeesArray(adaptedMeeting.attendees).join(", ");

    if (momByMeetingId && momByMeetingId.meetingId === adaptedMeeting.meetingId) {
      setMomForm({
        agenda: momByMeetingId.agenda || adaptedMeeting.agenda || "",
        meetingMode: momByMeetingId.meetingMode || adaptedMeeting.meetingMode || "Online",
        duration: momByMeetingId.duration || getDurationString() || "",
        participants: Array.isArray(momByMeetingId.participants)
          ? momByMeetingId.participants.join(", ")
          : momByMeetingId.participants || participants || "",
        summary: momByMeetingId.summary || "",
        notes: momByMeetingId.notes || "",
        createdBy: momByMeetingId.createdBy || currentUser?.name || "",
        meetingId: adaptedMeeting.meetingId || "",
        projectName: momByMeetingId.projectName || project?.projectName || "",
        status: momByMeetingId.status || "draft",
      });
      setMode("view");
      setIsEditMode(false);
    } else {
      setMomForm({
        agenda: adaptedMeeting.agenda || "",
        meetingMode: adaptedMeeting.meetingMode || "Online",
        duration: getDurationString() || "",
        participants: participants || "",
        summary: "",
        notes: "",
        createdBy: currentUser?.name || "",
        meetingId: adaptedMeeting.meetingId || "",
        projectName: project?.projectName || "",
        status: "draft",
      });
      setMode("form");
      setIsEditMode(false);
    }

    setReasonForDelay(momByMeetingId?.reasonForDelay || "");
    setIsAgreedToTerms(false);
    setSignatureFile(null);
    setSignaturePreview(null);
  }, [momByMeetingId, adaptedMeeting, currentUser?.name, project?.projectName, getDurationString, checkMeetingTimeStatus]);

  // Effect: Fetch MoM data when dialog opens
  useEffect(() => {
    if (adaptedMeeting.meetingId && adaptedMeeting.meetingId !== prevMeetingIdRef.current && !momByMeetingIdLoading) {
      prevMeetingIdRef.current = adaptedMeeting.meetingId;
      dispatch(fetchMoMByMeetingId(adaptedMeeting.meetingId));
    }
  }, [adaptedMeeting.meetingId, dispatch, momByMeetingIdLoading]);

  // Effect: Fetch MoM view when available
  useEffect(() => {
    if (momByMeetingId?.momId && mode === "view" && !momView?.pdfUrl) {
      dispatch(fetchMoMView(momByMeetingId.momId));
    }
  }, [momByMeetingId?.momId, mode, momView?.pdfUrl, dispatch]);

  // Effect: Clean up blob URLs and reset state
  useEffect(() => {
    return () => {
      if (momView?.pdfUrl) {
        URL.revokeObjectURL(momView.pdfUrl);
      }
      if (signaturePreview) {
        URL.revokeObjectURL(signaturePreview);
      }
      dispatch(resetMoMByMeetingId());
    };
  }, [momView?.pdfUrl, signaturePreview, dispatch]);

  // Handler: Form input changes
  const handleMomFormChange = (e, field) => {
    try {
      setMomForm((prev) => ({ ...prev, [field]: e.target.value }));
    } catch (error) {
      toast.error("Failed to update form input. Please try again.");
    }
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
  const areRequiredFieldsFilled = (status = "draft") => {
    const baseFields = momForm.createdBy.trim() && momForm.summary.trim() && momForm.projectName.trim();
    if (status === "final") {
      return baseFields && signatureFile && (!isTimeExceeded || (reasonForDelay.trim() && isAgreedToTerms));
    }
    return baseFields;
  };

  // Handler: Form submission
  const handleSubmit = async (status) => {
    if (!momForm.createdBy.trim()) {
      toast.info("Please enter the name of the person who created the MoM.");
      return;
    }
    if (!momForm.summary.trim()) {
      toast.info("Please enter a summary.");
      return;
    }
    if (!momForm.projectName.trim()) {
      toast.info("Project name is required.");
      return;
    }
    if (status === "final" && !signatureFile) {
      toast.info("Please upload a signature image.");
      return;
    }
    if (status === "final" && isTimeExceeded && !isEditMode && (!reasonForDelay.trim() || !isAgreedToTerms)) {
      toast.info("Please provide a reason for the delay and agree to the terms.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("agenda", momForm.agenda);
      formData.append("meetingMode", momForm.meetingMode);
      formData.append("duration", momForm.duration);
      const participantsArray = momForm.participants.split(",").map((p) => p.trim()).filter(Boolean);
      formData.append("participants", JSON.stringify(participantsArray));
      formData.append("summary", momForm.summary);
      formData.append("notes", momForm.notes);
      formData.append("createdBy", momForm.createdBy);
      formData.append("meetingId", momForm.meetingId);
      formData.append("projectName", momForm.projectName);
      formData.append("status", status);
      if (signatureFile) {
        formData.append("signature", signatureFile);
      }
      if (status === "final" && isTimeExceeded && !isEditMode) {
        formData.append("reasonForDelay", reasonForDelay);
      }

      let createMoMSuccess = false;

      if (isEditMode && momByMeetingId) {
        await dispatch(updateMoM(formData)).unwrap();
        toast.success(`MoM ${status === "draft" ? "updated as draft" : "finalized"} successfully!`);
      } else {
        const createMoMResult = await dispatch(createProjectMoM(formData)).unwrap();
        createMoMSuccess = !!createMoMResult;
        toast.success(`MoM ${status === "draft" ? "saved as draft" : "created"} successfully!`);
      }

      if (createMoMSuccess && status === "final" && isTimeExceeded && !isEditMode) {
        await dispatch(
          submitCause({
            meetingId: adaptedMeeting.meetingId,
            reason: reasonForDelay,
            submittedBy: currentUser?.name || momForm.createdBy,
          })
        ).unwrap();
        toast.success("Cause for delay submitted successfully!");
      }

      setMode("view");
      setIsEditMode(false);
      setReasonForDelay("");
      setIsAgreedToTerms(false);
      setSignatureFile(null);
      setSignaturePreview(null);
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} MoM: ${error.message || "Unknown error"}`);
    }
  };

  // Handler: Toggle mode
  const handleToggleMode = () => {
    if (mode === "view") {
      setMode("form");
      setIsEditMode(!!momByMeetingId);
    } else {
      setMode("view");
      setIsEditMode(false);
      setReasonForDelay("");
      setIsAgreedToTerms(false);
      setSignatureFile(null);
      setSignaturePreview(null);
    }
  };

  // Helper: Render participant with circled initial and email tooltip
  const renderParticipant = (participant, index) => {
    const initial = participant.charAt(0).toUpperCase();
    return (
      <div
        key={index}
        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success font-semibold text-sm cursor-pointer group"
        title={participant}
      >
        {initial}
        <span className="absolute left-0 top-full mt-2 hidden group-hover:block bg-muted-foreground text-background text-xs rounded py-1 px-2 z-10">
          {participant}
        </span>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="w-full p-4 sm:p-6 bg-background rounded-xl">
        {momByMeetingIdLoading ? (
          <div className="min-h-[400px] bg-background rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <span className="text-primary text-lg font-semibold">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                {mode === "form" ? (isEditMode ? "Edit Minutes of Meeting" : "Create Minutes of Meeting") : "Meeting Details"}
              </h2>
              {mode === "view" && momByMeetingId && (
                <Button
                  variant="ghost"
                  onClick={handleToggleMode}
                  className="text-primary hover:bg-primary/10"
                  aria-label="Edit MoM"
                >
                  <Edit2 className="h-5 w-5" />
                </Button>
              )}
            </div>

            {isTimeExceeded && (!momByMeetingId || !isWithinOneHour) && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  {!momByMeetingId
                    ? isWithinOneHour
                      ? "Please complete MoM within one hour of meeting end time."
                      : "Meeting has ended, and no MoM has been created."
                    : "Meeting has ended, and MoM creation is delayed beyond one hour."}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-primary font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Project Name
                  </Label>
                  <p className="text-foreground text-sm sm:text-base">{project?.projectName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-primary font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Agenda
                  </Label>
                  <p className="text-foreground text-sm sm:text-base">{adaptedMeeting.agenda || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-primary font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Meeting Mode
                  </Label>
                  <p className="text-foreground text-sm sm:text-base">{adaptedMeeting.meetingMode || "Online"}</p>
                </div>
                <div>
                  <Label className="text-primary font-semibold flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Duration
                  </Label>
                  <p className="text-foreground text-sm sm:text-base">{getDurationString() || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-primary font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participants
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getAttendeesArray(adaptedMeeting.attendees).length > 0 ? (
                      getAttendeesArray(adaptedMeeting.attendees).map((participant, index) =>
                        renderParticipant(participant, index)
                      )
                    ) : (
                      <p className="text-foreground text-sm sm:text-base">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mode === "form" ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-primary font-semibold flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Summary
                      </Label>
                      <Textarea
                        value={momForm.summary}
                        onChange={(e) => handleMomFormChange(e, "summary")}
                        placeholder="Enter meeting summary..."
                        className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="text-primary font-semibold flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Notes
                      </Label>
                      <Textarea
                        value={momForm.notes}
                        onChange={(e) => handleMomFormChange(e, "notes")}
                        placeholder="Enter additional notes..."
                        className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
                        rows={4}
                      />
                    </div>
                    {isTimeExceeded && !isEditMode && (
                      <>
                        <div>
                          <Label className="text-primary font-semibold flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
                            Reason for Delay
                          </Label>
                          <Textarea
                            value={reasonForDelay}
                            onChange={handleReasonForDelayChange}
                            placeholder="Enter reason for delay..."
                            className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={isAgreedToTerms}
                            onCheckedChange={handleTermsChange}
                            className="border-border data-[state=checked]:bg-primary"
                          />
                          <Label htmlFor="terms" className="text-primary font-semibold text-sm sm:text-base">
                            I agree to the cause terms and conditions
                          </Label>
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="text-primary font-semibold flex items-center">
                        <Signature className="h-5 w-5 mr-2" />
                        Signature (Image)
                      </Label>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleSignatureFileChange}
                        className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
                      />
                      {signaturePreview && (
                        <div className="mt-2">
                          <Image
                            src={signaturePreview}
                            alt="Signature Preview"
                            width={120}
                            height={80}
                            className="rounded-md border border-border"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-primary font-semibold flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Created By
                      </Label>
                      <Input
                        value={momForm.createdBy}
                        onChange={(e) => handleMomFormChange(e, "createdBy")}
                        placeholder="Recorder's name..."
                        className="mt-1 border-border focus:ring-1 focus:ring-primary bg-background rounded-lg text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      {isEditMode && (
                        <Button
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/10 rounded-lg text-sm sm:text-base"
                          onClick={() => setMode("view")}
                          aria-label="Cancel MoM editing"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 rounded-lg text-sm sm:text-base"
                        onClick={() => handleSubmit("draft")}
                        disabled={momByMeetingIdLoading || !areRequiredFieldsFilled("draft")}
                        aria-label="Save MoM as draft"
                      >
                        {momByMeetingIdLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save as Draft"
                        )}
                      </Button>
                      <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm sm:text-base"
                        onClick={() => handleSubmit("final")}
                        disabled={momByMeetingIdLoading || !areRequiredFieldsFilled("final")}
                        aria-label={isEditMode ? "Finalize MoM" : "Create MoM"}
                      >
                        {momByMeetingIdLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : isEditMode ? (
                          "Finalize MoM"
                        ) : (
                          "Create MoM"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {momByMeetingId && (
                      <div>
                        {momView?.pdfUrl ? (
                          <div>
                            <div className="w-full h-[300px] sm:h-[400px] rounded-lg border border-border overflow-hidden">
                              <iframe
                                src={momView.pdfUrl}
                                width="100%"
                                height="100%"
                                className="rounded-lg"
                                title="MoM PDF Preview"
                                type="application/pdf"
                                onError={(e) => console.error("Iframe error:", e)}
                              />
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = momView.pdfUrl;
                                link.download = `MoM_${momByMeetingId.meetingId}.pdf`;
                                link.click();
                              }}
                              className="mt-2 bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                            >
                              Download PDF
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted text-muted-foreground rounded-lg flex items-center text-sm">
                            <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>No PDF available for this MoM.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default ProjectWiseTeamMeetMOMDetails;







































