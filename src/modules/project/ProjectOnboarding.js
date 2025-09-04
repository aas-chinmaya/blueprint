
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { validateInput, sanitizeInput } from "@/utils/sanitize";
// import TeamLeadSelect from "@/modules/project/TeamLeadSelect";
// import ClientSelect from "@/modules/project/ClientSelect";
// import { toast } from "sonner";
// import {
//   FiCalendar,
//   FiUser,
//   FiFileText,
//   FiSave,
//   FiUpload,
//   FiX,
//   FiFolder,
//   FiFile,
//   FiArrowLeft,
// } from "react-icons/fi";
// import {
//   createProject,
//   fetchAllProjects,
//   resetProjectCreation,
// } from "@/features/projectSlice";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function ProjectOnboarding() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, successMessage } = useSelector((state) => ({
//     loading: state.project.status.projectCreation === "loading",
//     error: state.project.error.projectCreation,
//     successMessage: state.project.successMessage,
//   }));

//   const formRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const clientSelectRef = useRef(null);
//   const teamLeadSelectRef = useRef(null);
//   const [formData, setFormData] = useState({
//     projectName: "",
//     description: "",
//     clientId: undefined,
//     teamLeadId: "",
//     teamLeadName: "",
//     startDate: "",
//     endDate: "",
//     category: "",
//     attachments: [],
//   });
//   const [formErrors, setFormErrors] = useState({
//     projectName: "",
//     description: "",
//     clientId: "",
//     teamLeadId: "",
//     startDate: "",
//     endDate: "",
//     category: "",
//   });
//   const [fileErrors, setFileErrors] = useState([]);
//   const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
//   const [isTeamLeadSelectOpen, setIsTeamLeadSelectOpen] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [hasHandledSuccess, setHasHandledSuccess] = useState(false);

//   // Handle success and error toasts
//   useEffect(() => {
//     if (successMessage && !hasHandledSuccess) {
//       setHasHandledSuccess(true);
//       toast.success(successMessage || "Project created successfully!");
//       dispatch(fetchAllProjects());
//       router.push("/project");
//       dispatch(resetProjectCreation());
//     }
//     if (error) {
//       toast.error(error || "Failed to create project!");
//       dispatch(resetProjectCreation());
//     }
//   }, [successMessage, error, router, dispatch, hasHandledSuccess]);

//   // Click outside handler for select dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         clientSelectRef.current &&
//         !clientSelectRef.current.contains(event.target)
//       ) {
//         setIsClientSelectOpen(false);
//       }
//       if (
//         teamLeadSelectRef.current &&
//         !teamLeadSelectRef.current.contains(event.target)
//       ) {
//         setIsTeamLeadSelectOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const validation = validateInput(value);

//     if (!validation.isValid) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [name]: validation.warning,
//       }));
//       return;
//     }

//     setFormErrors((prev) => ({
//       ...prev,
//       [name]: "",
//     }));

//     const sanitizedValue = sanitizeInput(value);
//     const updatedFormData = {
//       ...formData,
//       [name]: sanitizedValue,
//     };

//     // Reset clientId when category changes to in house
//     if (name === "category" && sanitizedValue === "in house") {
//       updatedFormData.clientId = undefined;
//       setFormErrors((prev) => ({
//         ...prev,
//         clientId: "",
//       }));
//     }

//     if (
//       name === "startDate" &&
//       updatedFormData.endDate &&
//       new Date(sanitizedValue) > new Date(updatedFormData.endDate)
//     ) {
//       setFormErrors((prev) => ({
//         ...prev,
//         startDate: "Start date cannot be after end date",
//       }));
//     } else if (
//       name === "endDate" &&
//       updatedFormData.startDate &&
//       new Date(updatedFormData.startDate) > new Date(sanitizedValue)
//     ) {
//       setFormErrors((prev) => ({
//         ...prev,
//         endDate: "End date cannot be before start date",
//       }));
//     }

//     setFormData(updatedFormData);
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       handleFiles(e.dataTransfer.files);
//     }
//   };

//   const handleFiles = (files) => {
//     const newFiles = Array.from(files);
//     const validFiles = [];
//     const errors = [];

//     const allowedTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "application/vnd.ms-powerpoint",
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//       "text/plain",
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "video/mp4",
//       "video/mov",
//       "video/avi",
//       "audio/mpeg",
//       "audio/wav",
//     ];

//     const maxSize = 10 * 1024 * 1024; // 10MB

//     newFiles.forEach((file) => {
//       if (!allowedTypes.includes(file.type)) {
//         errors.push(`File ${file.name} has an unsupported type.`);
//       } else if (file.size > maxSize) {
//         errors.push(`File ${file.name} exceeds 10MB.`);
//       } else {
//         validFiles.push(file);
//       }
//     });

//     if (errors.length > 0) {
//       setFileErrors(errors);
//       toast.error(errors.join(" "));
//     }

//     if (validFiles.length > 0) {
//       setFormData((prev) => ({
//         ...prev,
//         attachments: [...prev.attachments, ...validFiles],
//       }));
//       setFileErrors([]);
//     }
//   };

//   const removeFile = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       attachments: prev.attachments.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let hasErrors = false;
//     const newErrors = { ...formErrors };

//     for (const [key, value] of Object.entries(formData)) {
//       if (key === "attachments" || key === "teamLeadName") continue;
//       if (key === "clientId" && formData.category === "in house") continue;
//       const validation = validateInput(value);
//       if (!validation.isValid) {
//         newErrors[key] = validation.warning;
//         hasErrors = true;
//       }
//     }

//     if (formData.startDate && formData.endDate) {
//       if (new Date(formData.startDate) > new Date(formData.endDate)) {
//         newErrors.startDate = "Start date cannot be after end date";
//         newErrors.endDate = "End date cannot be before start date";
//         hasErrors = true;
//       }
//     }

//     if (hasErrors) {
//       setFormErrors(newErrors);
//       toast.error("Please fix the errors in the form before submitting.");
//       return;
//     }

//     const submissionData = new FormData();
//     submissionData.append("projectName", formData.projectName);
//     submissionData.append("description", formData.description);
//     if (formData.category === "client") {
//       submissionData.append("clientId", formData.clientId);
//     }
//     submissionData.append("teamLeadId", formData.teamLeadId);
//     submissionData.append("teamLeadName", formData.teamLeadName);
//     submissionData.append("startDate", formData.startDate);
//     submissionData.append("endDate", formData.endDate);
//     submissionData.append("category", formData.category);

//     // Append attachments under the 'attachments' key
//     formData.attachments.forEach((file) => {
//       submissionData.append("attachments", file);
//     });

//     // Debug FormData contents
//     if (process.env.NODE_ENV === "development") {
     
//       for (let [key, value] of submissionData.entries()) {
//         // console.log(`${key}: ${value instanceof File ? `${value.name} (${value.size} bytes)` : value}`);
//       }
//     }

//     try {
//       await dispatch(createProject(submissionData)).unwrap();
//     } catch (err) {
//       // console.error("Project creation error:", err);
//       toast.error(`Failed to create project: ${err.message || "Unknown error"}`);
//     }
//   };

//   const getFileIcon = (file) => {
//     const fileName = file.name || "unknown";
//     const extension = fileName.split(".").pop().toLowerCase();
//     return <FiFile className="text-gray-800" aria-hidden="true" />;
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <Card className="w-full max-w-7xl bg-white border border-gray-200 shadow-md">
//           <CardContent className="p-6">
//             <Skeleton className="h-12 w-full mb-4" />
//             <Skeleton className="h-8 w-3/4 mb-4" />
//             <Skeleton className="h-24 w-full mb-4" />
//             <Skeleton className="h-10 w-1/2" />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (

//       <Card
//         ref={formRef}
//         className="min-h-screen bg-white border border-gray-200 shadow-md"
//       >
//         <CardHeader>
//           <div className="flex items-center gap-4 sm:gap-6">
//             <Button
//               variant="outline"
//               onClick={() => router.back()}
//               className="flex items-center gap-2 border-gray-300 text-gray-800 hover:bg-gray-100"
//               aria-label="Back to projects"
//             >
//               <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
//               <span className="hidden sm:inline">Back</span>
//             </Button>
//             <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
//               Onboard New Project
//             </CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <form
//             id="project-form"
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 md:grid-cols-2 gap-6"
//           >
//             <div className="space-y-6">
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="projectName"
//                   className={formErrors.projectName ? "text-red-500" : "text-gray-800"}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FiFileText aria-hidden="true" className="text-gray-800" />
//                     Project Name
//                     {formErrors.projectName && (
//                       <span className="text-xs">({formErrors.projectName})</span>
//                     )}
//                   </div>
//                 </Label>
//                 <Input
//                   id="projectName"
//                   name="projectName"
//                   value={formData.projectName}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   placeholder="Enter project name"
//                   className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.projectName ? "border-red-300" : ""}`}
//                   aria-label="Project name"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="category"
//                   className={formErrors.category ? "text-red-500" : "text-gray-800"}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FiFolder aria-hidden="true" className="text-gray-800" />
//                     Category
//                     {formErrors.category && (
//                       <span className="text-xs">({formErrors.category})</span>
//                     )}
//                   </div>
//                 </Label>
//                 <Select
//                   name="category"
//                   value={formData.category}
//                   onValueChange={(value) =>
//                     handleChange({ target: { name: "category", value } })
//                   }
//                   disabled={loading}
//                 >
//                   <SelectTrigger
//                     className={`border-gray-300 w-full focus:ring-[#1447e6] text-gray-800 ${formErrors.category ? "border-red-300" : ""}`}
//                     aria-label="Project category"
//                   >
//                     <SelectValue placeholder="Select Category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="client">Client</SelectItem>
//                     <SelectItem value="in house">In House</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {formData.category === "client" && (
//                 <div ref={clientSelectRef} className="space-y-2">
//                   <Label
//                     htmlFor="clientId"
//                     className={formErrors.clientId ? "text-red-500" : "text-gray-800"}
//                   >
//                     <div className="flex items-center gap-2">
//                       <FiUser aria-hidden="true" className="text-gray-800" />
//                       Client
//                       {formErrors.clientId && (
//                         <span className="text-xs">({formErrors.clientId})</span>
//                       )}
//                     </div>
//                   </Label>
//                   <ClientSelect
//                     value={formData.clientId}
//                     isOpen={isClientSelectOpen}
//                     onToggle={() => setIsClientSelectOpen(!isClientSelectOpen)}
//                     onChange={(value) => {
//                       setFormData((prev) => ({ ...prev, clientId: value }));
//                       setIsClientSelectOpen(false);
//                       setFormErrors((prev) => ({ ...prev, clientId: "" }));
//                     }}
//                     disabled={loading}
//                     className="border-gray-300 focus:ring-[#1447e6] text-gray-800"
//                   />
//                 </div>
//               )}

//               <div ref={teamLeadSelectRef} className="space-y-2">
//                 <Label
//                   htmlFor="teamLeadId"
//                   className={formErrors.teamLeadId ? "text-red-500" : "text-gray-800"}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FiUser aria-hidden="true" className="text-gray-800" />
//                     Team Lead
//                     {formErrors.teamLeadId && (
//                       <span className="text-xs">({formErrors.teamLeadId})</span>
//                     )}
//                   </div>
//                 </Label>
//                 <TeamLeadSelect
//                   value={formData.teamLeadId}
//                   isOpen={isTeamLeadSelectOpen}
//                   onToggle={() => setIsTeamLeadSelectOpen(!isTeamLeadSelectOpen)}
//                   onChange={({ teamLeadId, teamLeadName }) => {
//                     setFormData((prev) => ({
//                       ...prev,
//                       teamLeadId,
//                       teamLeadName,
//                     }));
//                     setIsTeamLeadSelectOpen(false);
//                     setFormErrors((prev) => ({ ...prev, teamLeadId: "" }));
//                   }}
//                   disabled={loading}
//                   className="border-gray-300 focus:ring-[#1447e6] text-gray-800"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="startDate"
//                   className={formErrors.startDate ? "text-red-500" : "text-gray-800"}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FiCalendar aria-hidden="true" className="text-gray-800" />
//                     Start Date
//                     {formErrors.startDate && (
//                       <span className="text-xs">({formErrors.startDate})</span>
//                     )}
//                   </div>
//                 </Label>
//                 <Input
//                   id="startDate"
//                   type="date"
//                   name="startDate"
//                   value={formData.startDate}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.startDate ? "border-red-300" : ""}`}
//                   aria-label="Start date"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label
//                   htmlFor="endDate"
//                   className={formErrors.endDate ? "text-red-500" : "text-gray-800"}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FiCalendar aria-hidden="true" className="text-gray-800" />
//                     End Date
//                     {formErrors.endDate && (
//                       <span className="text-xs">({formErrors.endDate})</span>
//                     )}
//                   </div>
//                 </Label>
//                 <Input
//                   id="endDate"
//                   type="date"
//                   name="endDate"
//                   value={formData.endDate}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.endDate ? "border-red-300" : ""}`}
//                   aria-label="End date"
//                 />
//               </div>

//               <div
//                 className={`p-4 border rounded-md transition-colors duration-200 ${
//                   dragActive ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//                 onClick={() => !loading && fileInputRef.current?.click()}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     !loading && fileInputRef.current?.click();
//                   }
//                 }}
//                 aria-label="File upload area"
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   onChange={(e) => handleFiles(e.target.files)}
//                   className="hidden"
//                   disabled={loading}
//                   accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/jpeg,image/png,image/gif,video/mp4,video/mov,video/avi,audio/mpeg,audio/wav"
//                   aria-hidden="true"
//                 />
//                 <div className="text-center space-y-2">
//                   <FiUpload className="mx-auto text-xl text-gray-800" aria-hidden="true" />
//                   <p className="text-sm text-gray-600">
//                     Drag & drop files or click to upload (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, MP4, MOV, AVI, MP3, WAV)
//                   </p>
//                 </div>
//                 {formData.attachments.length > 0 && (
//                   <div className="mt-3 cursor-pointer grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2">
//                     {formData.attachments.map((file, index) => {
//                       const fileName = file.name;
//                       const extension = fileName.split(".").pop().toLowerCase();
//                       const truncatedName = fileName.substring(
//                         0,
//                         Math.min(8, fileName.length - extension.length - 1)
//                       );
//                       const displayName = `${truncatedName}...${extension}`;

//                       return (
//                         <div
//                           key={`attachment-${index}`}
//                           className="relative group flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md text-sm hover:bg-gray-100 transition-all duration-200"
//                         >
//                           <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => removeFile(index)}
//                               disabled={loading}
//                               className="text-gray-800 hover:text-[#1447e6]"
//                               aria-label={`Remove ${fileName}`}
//                             >
//                               <FiX size={16} />
//                             </Button>
//                           </div>
//                           <div className="flex flex-col items-center gap-2">
//                             <div className="text-2xl">{getFileIcon(file)}</div>
//                             <span
//                               className="text-gray-600 text-xs text-center"
//                               title={fileName}
//                             >
//                               {displayName}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label
//                 htmlFor="description"
//                 className={formErrors.description ? "text-red-500" : "text-gray-800"}
//               >
//                 <div className="flex items-center gap-2">
//                   <FiFileText aria-hidden="true" className="text-gray-800" />
//                   Description
//                   {formErrors.description && (
//                     <span className="text-xs">({formErrors.description})</span>
//                   )}
//                 </div>
//               </Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 disabled={loading}
//                 className={`min-h-[calc(100%-2rem)] border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.description ? "border-red-300" : ""}`}
//                 placeholder="Describe your project..."
//                 aria-label="Project description"
//               />
//             </div>
//           </form>

//           <div className="flex justify-end mt-6">
//             <Button
//               type="submit"
//               form="project-form"
//               disabled={loading}
//               className="flex items-center gap-2 bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
//               aria-label="Create project"
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
//                     ></path>
//                   </svg>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   {/* <FiSave aria-hidden="true" /> */}
//                   Create Project
//                 </>
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
  
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { validateInput, sanitizeInput } from "@/utils/sanitize";
import TeamLeadSelect from "@/modules/project/TeamLeadSelect";
import ClientSelect from "@/modules/project/ClientSelect";
import { toast } from "sonner";
import {
  FiCalendar,
  FiUser,
  FiFileText,
  FiSave,
  FiUpload,
  FiX,
  FiFolder,
  FiFile,
  FiArrowLeft,
} from "react-icons/fi";
import {
  createProject,
  fetchAllProjects,
  resetProjectCreation,
} from "@/features/projectSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectOnboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => ({
    loading: state.project.status.projectCreation === "loading",
    error: state.project.error.projectCreation,
    successMessage: state.project.successMessage,
  }));

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const clientSelectRef = useRef(null);
  const teamLeadSelectRef = useRef(null);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    clientId: undefined,
    teamLeadId: "",
    teamLeadName: "",
    startDate: "",
    endDate: "",
    expectedEndDate: "",
    category: "",
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({
    projectName: "",
    description: "",
    clientId: "",
    teamLeadId: "",
    startDate: "",
    endDate: "",
    expectedEndDate: "",
    category: "",
  });
  const [fileErrors, setFileErrors] = useState([]);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [isTeamLeadSelectOpen, setIsTeamLeadSelectOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hasHandledSuccess, setHasHandledSuccess] = useState(false);

  // Handle success and error toasts
  useEffect(() => {
    if (successMessage && !hasHandledSuccess) {
      setHasHandledSuccess(true);
      toast.success(successMessage || "Project created successfully!");
      dispatch(fetchAllProjects());
      router.push("/project");
      dispatch(resetProjectCreation());
    }
    if (error) {
      toast.error(error || "Failed to create project!");
      dispatch(resetProjectCreation());
    }
  }, [successMessage, error, router, dispatch, hasHandledSuccess]);

  // Click outside handler for select dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clientSelectRef.current &&
        !clientSelectRef.current.contains(event.target)
      ) {
        setIsClientSelectOpen(false);
      }
      if (
        teamLeadSelectRef.current &&
        !teamLeadSelectRef.current.contains(event.target)
      ) {
        setIsTeamLeadSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const validation = validateInput(value);

    if (!validation.isValid) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validation.warning,
      }));
      return;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    const sanitizedValue = sanitizeInput(value);
    const updatedFormData = {
      ...formData,
      [name]: sanitizedValue,
    };

    // Reset clientId when category changes to in house
    if (name === "category" && sanitizedValue === "in house") {
      updatedFormData.clientId = undefined;
      setFormErrors((prev) => ({
        ...prev,
        clientId: "",
      }));
    }

    if (
      name === "startDate" &&
      updatedFormData.endDate &&
      new Date(sanitizedValue) > new Date(updatedFormData.endDate)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        startDate: "Start date cannot be after end date",
      }));
    } else if (
      name === "endDate" &&
      updatedFormData.startDate &&
      new Date(updatedFormData.startDate) > new Date(sanitizedValue)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        endDate: "End date cannot be before start date",
      }));
    } else if (
      name === "expectedEndDate" &&
      updatedFormData.endDate &&
      new Date(sanitizedValue) < new Date(updatedFormData.endDate)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        expectedEndDate: "Expected end date must be after end date",
      }));
    } else if (
      name === "endDate" &&
      updatedFormData.expectedEndDate &&
      new Date(sanitizedValue) > new Date(updatedFormData.expectedEndDate)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        expectedEndDate: "Expected end date must be after end date",
      }));
    }

    setFormData(updatedFormData);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    const validFiles = [];
    const errors = [];

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/avi",
      "audio/mpeg",
      "audio/wav",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    newFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${file.name} has an unsupported type.`);
      } else if (file.size > maxSize) {
        errors.push(`File ${file.name} exceeds 10MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setFileErrors(errors);
      toast.error(errors.join(" "));
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles],
      }));
      setFileErrors([]);
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrors = false;
    const newErrors = { ...formErrors };

    for (const [key, value] of Object.entries(formData)) {
      if (key === "attachments" || key === "teamLeadName") continue;
      if (key === "clientId" && formData.category === "in house") continue;
      const validation = validateInput(value);
      if (!validation.isValid) {
        newErrors[key] = validation.warning;
        hasErrors = true;
      }
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.startDate = "Start date cannot be after end date";
        newErrors.endDate = "End date cannot be before start date";
        hasErrors = true;
      }
    }

    if (formData.endDate && formData.expectedEndDate) {
      if (new Date(formData.endDate) > new Date(formData.expectedEndDate)) {
        newErrors.expectedEndDate = "Expected end date must be after end date";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFormErrors(newErrors);
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    const submissionData = new FormData();
    submissionData.append("projectName", formData.projectName);
    submissionData.append("description", formData.description);
    if (formData.category === "client") {
      submissionData.append("clientId", formData.clientId);
    }
    submissionData.append("teamLeadId", formData.teamLeadId);
    submissionData.append("teamLeadName", formData.teamLeadName);
    submissionData.append("startDate", formData.startDate);
    submissionData.append("endDate", formData.endDate);
    submissionData.append("expectedEndDate", formData.expectedEndDate);
    submissionData.append("category", formData.category);

    formData.attachments.forEach((file) => {
      submissionData.append("attachments", file);
    });

    // Debug FormData contents
    if (process.env.NODE_ENV === "development") {
      for (let [key, value] of submissionData.entries()) {
        // console.log(`${key}: ${value instanceof File ? `${value.name} (${value.size} bytes)` : value}`);
      }
    }

    try {
      await dispatch(createProject(submissionData)).unwrap();
    } catch (err) {
      // console.error("Project creation error:", err);
      toast.error(`Failed to create project: ${err.message || "Unknown error"}`);
    }
  };

  const getFileIcon = (file) => {
    const fileName = file.name || "unknown";
    const extension = fileName.split(".").pop().toLowerCase();
    return <FiFile className="text-gray-800" aria-hidden="true" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-7xl bg-white border border-gray-200 shadow-md">
          <CardContent className="p-6">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card
      ref={formRef}
      className="min-h-screen bg-white border border-gray-200 shadow-md"
    >
      <CardHeader>
        <div className="flex items-center gap-4 sm:gap-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 border-gray-300 text-gray-800 hover:bg-gray-100"
            aria-label="Back to projects"
          >
            <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
            Onboard New Project
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form
          id="project-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="projectName"
                className={formErrors.projectName ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiFileText aria-hidden="true" className="text-gray-800" />
                  Project Name
                  {formErrors.projectName && (
                    <span className="text-xs">({formErrors.projectName})</span>
                  )}
                </div>
              </Label>
              <Input
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter project name"
                className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.projectName ? "border-red-300" : ""}`}
                aria-label="Project name"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="category"
                className={formErrors.category ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiFolder aria-hidden="true" className="text-gray-800" />
                  Category
                  {formErrors.category && (
                    <span className="text-xs">({formErrors.category})</span>
                  )}
                </div>
              </Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) =>
                  handleChange({ target: { name: "category", value } })
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={`border-gray-300 w-full focus:ring-[#1447e6] text-gray-800 ${formErrors.category ? "border-red-300" : ""}`}
                  aria-label="Project category"
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="in house">In House</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.category === "client" && (
              <div ref={clientSelectRef} className="space-y-2">
                <Label
                  htmlFor="clientId"
                  className={formErrors.clientId ? "text-red-500" : "text-gray-800"}
                >
                  <div className="flex items-center gap-2">
                    <FiUser aria-hidden="true" className="text-gray-800" />
                    Client
                    {formErrors.clientId && (
                      <span className="text-xs">({formErrors.clientId})</span>
                    )}
                  </div>
                </Label>
                <ClientSelect
                  value={formData.clientId}
                  isOpen={isClientSelectOpen}
                  onToggle={() => setIsClientSelectOpen(!isClientSelectOpen)}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, clientId: value }));
                    setIsClientSelectOpen(false);
                    setFormErrors((prev) => ({ ...prev, clientId: "" }));
                  }}
                  disabled={loading}
                  className="border-gray-300 focus:ring-[#1447e6] text-gray-800"
                />
              </div>
            )}

            <div ref={teamLeadSelectRef} className="space-y-2">
              <Label
                htmlFor="teamLeadId"
                className={formErrors.teamLeadId ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiUser aria-hidden="true" className="text-gray-800" />
                  Team Lead
                  {formErrors.teamLeadId && (
                    <span className="text-xs">({formErrors.teamLeadId})</span>
                  )}
                </div>
              </Label>
              <TeamLeadSelect
                value={formData.teamLeadId}
                isOpen={isTeamLeadSelectOpen}
                onToggle={() => setIsTeamLeadSelectOpen(!isTeamLeadSelectOpen)}
                onChange={({ teamLeadId, teamLeadName }) => {
                  setFormData((prev) => ({
                    ...prev,
                    teamLeadId,
                    teamLeadName,
                  }));
                  setIsTeamLeadSelectOpen(false);
                  setFormErrors((prev) => ({ ...prev, teamLeadId: "" }));
                }}
                disabled={loading}
                className="border-gray-300 focus:ring-[#1447e6] text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className={formErrors.startDate ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiCalendar aria-hidden="true" className="text-gray-800" />
                  Start Date
                  {formErrors.startDate && (
                    <span className="text-xs">({formErrors.startDate})</span>
                  )}
                </div>
              </Label>
              <Input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
                className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.startDate ? "border-red-300" : ""}`}
                aria-label="Start date"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className={formErrors.endDate ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiCalendar aria-hidden="true" className="text-gray-800" />
                  End Date
                  {formErrors.endDate && (
                    <span className="text-xs">({formErrors.endDate})</span>
                  )}
                </div>
              </Label>
              <Input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={loading}
                className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.endDate ? "border-red-300" : ""}`}
                aria-label="End date"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="expectedEndDate"
                className={formErrors.expectedEndDate ? "text-red-500" : "text-gray-800"}
              >
                <div className="flex items-center gap-2">
                  <FiCalendar aria-hidden="true" className="text-gray-800" />
                  Expected End Date
                  {formErrors.expectedEndDate && (
                    <span className="text-xs">({formErrors.expectedEndDate})</span>
                  )}
                </div>
              </Label>
              <Input
                id="expectedEndDate"
                type="date"
                name="expectedEndDate"
                value={formData.expectedEndDate}
                onChange={handleChange}
                required
                disabled={loading}
                className={`border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.expectedEndDate ? "border-red-300" : ""}`}
                aria-label="Expected end date"
              />
            </div>

            <div
              className={`p-4 border rounded-md transition-colors duration-200 ${
                dragActive ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  !loading && fileInputRef.current?.click();
                }
              }}
              aria-label="File upload area"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                disabled={loading}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/jpeg,image/png,image/gif,video/mp4,video/mov,video/avi,audio/mpeg,audio/wav"
                aria-hidden="true"
              />
              <div className="text-center space-y-2">
                <FiUpload className="mx-auto text-xl text-gray-800" aria-hidden="true" />
                <p className="text-sm text-gray-600">
                  Drag & drop files or click to upload (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, MP4, MOV, AVI, MP3, WAV)
                </p>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-3 cursor-pointer grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2">
                  {formData.attachments.map((file, index) => {
                    const fileName = file.name;
                    const extension = fileName.split(".").pop().toLowerCase();
                    const truncatedName = fileName.substring(
                      0,
                      Math.min(8, fileName.length - extension.length - 1)
                    );
                    const displayName = `${truncatedName}...${extension}`;

                    return (
                      <div
                        key={`attachment-${index}`}
                        className="relative group flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md text-sm hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={loading}
                            className="text-gray-800 hover:text-[#1447e6]"
                            aria-label={`Remove ${fileName}`}
                          >
                            <FiX size={16} />
                          </Button>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-2xl">{getFileIcon(file)}</div>
                          <span
                            className="text-gray-600 text-xs text-center"
                            title={fileName}
                          >
                            {displayName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className={formErrors.description ? "text-red-500" : "text-gray-800"}
            >
              <div className="flex items-center gap-2">
                <FiFileText aria-hidden="true" className="text-gray-800" />
                Description
                {formErrors.description && (
                  <span className="text-xs">({formErrors.description})</span>
                )}
              </div>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              className={`min-h-[calc(100%-2rem)] border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400 ${formErrors.description ? "border-red-300" : ""}`}
              placeholder="Describe your project..."
              aria-label="Project description"
            />
          </div>
        </form>

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            form="project-form"
            disabled={loading}
            className="flex items-center gap-2 bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
            aria-label="Create project"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                Create Project
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}