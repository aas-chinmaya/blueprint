

// import { cn } from '@/lib/utils';
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { format, parseISO, isValid } from 'date-fns';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { CalendarIcon, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { fetchMeetingMomById, createProjectMeetingMom, updateProjectMeetingMom } from '@/features/projectmeetingmomSlice';

// const MomForm = ({ open, onOpenChange, selectedMom, selectedMomLoading, selectedMomError, editingMom, currentUser, projectName, projectId }) => {
//   const dispatch = useDispatch();
//   const [formData, setFormData] = useState({
//     projectName: projectName || '',
//     projectId: projectId || '',
//     agenda: '',
//     meetingMode: 'offline',
//     meetingId: '',
//     title: '',
//     meetingDate: null,
//     startTime: '',
//     duration: '',
//     attendees: [],
//     summary: '',
//     notes: '',
//     createdBy: currentUser || '',
//     status: 'draft',
//     signature: null,
//     signatureUrl: '',
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [newAttendee, setNewAttendee] = useState('');

//   // Fetch MoM data when in edit mode
//   useEffect(() => {
//     if (editingMom && editingMom.momId) {
//       dispatch(fetchMeetingMomById(editingMom.momId));
//     }
//   }, [editingMom, dispatch]);

//   // Handle API errors
//   useEffect(() => {
//     if (selectedMomError) {
//       toast.error(selectedMomError);
//     }
//   }, [selectedMomError]);

//   // Autofill form when selectedMom is updated
//   useEffect(() => {
//     if (editingMom && selectedMom && selectedMom.data) {
//       const momData = selectedMom.data;
//       const meetingDate = momData.date && isValid(parseISO(momData.date)) ? parseISO(momData.date) : null;
//       const startTime = momData.time || '';

//       setFormData({
//         projectName: projectName || momData.projectName || '',
//         projectId: projectId || momData.projectId || '',
//         agenda: momData.agenda || '',
//         meetingMode: momData.meetingMode || 'offline',
//         meetingId: momData.meetingId || '',
//         title: momData.title || momData.momId || '',
//         meetingDate,
//         startTime,
//         duration: momData.duration || '',
//         attendees: Array.isArray(momData.attendees) ? momData.attendees : [],
//         summary: momData.summary || '',
//         notes: momData.notes || '',
//         createdBy: currentUser || momData.createdBy || '',
//         status: momData.status || 'draft',
//         signature: null,
//         signatureUrl: momData.signature || '',
//       });
//       setFormErrors({});
//     } else if (!editingMom) {
//       // Reset form for create mode
//       setFormData({
//         projectName: projectName || '',
//         projectId: projectId || '',
//         agenda: '',
//         meetingMode: 'offline',
//         meetingId: '',
//         title: '',
//         meetingDate: null,
//         startTime: '',
//         duration: '',
//         attendees: [],
//         summary: '',
//         notes: '',
//         createdBy: currentUser || '',
//         status: 'draft',
//         signature: null,
//         signatureUrl: '',
//       });
//       setFormErrors({});
//     }
//   }, [editingMom, selectedMom, projectName, projectId, currentUser]);

//   const validateForm = () => {
//     const errors = {};
//     if (!formData.title) errors.title = 'Title is required';
//     if (!formData.agenda) errors.agenda = 'Agenda is required';
//     if (!formData.meetingDate) errors.meetingDate = 'Meeting date is required';
//     if (!formData.startTime) errors.startTime = 'Start time is required';
//     if (formData.attendees.length === 0) errors.attendees = 'At least one attendee is required';
//     if (formData.meetingMode === 'online' && !formData.meetingId) errors.meetingId = 'Meeting ID is required for online meetings';
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleFormSubmit = (e, status) => {
//     e.preventDefault();
//     if (validateForm()) {
//       const formattedData = new FormData();
//       formattedData.append('projectName', formData.projectName);
//       formattedData.append('projectId', formData.projectId);
//       formattedData.append('agenda', formData.agenda);
//       formattedData.append('meetingMode', formData.meetingMode);
//       if (formData.meetingId) formattedData.append('meetingId', formData.meetingId);
//       formattedData.append('title', formData.title);
//       formattedData.append('date', formData.meetingDate ? format(formData.meetingDate, 'yyyy-MM-dd') : '');
//       // Format time as HH:mm:ss
//       formattedData.append('time', formData.startTime ? `${formData.startTime}:00` : '');
//       if (formData.duration) formattedData.append('duration', formData.duration);
//       // Append each attendee as a separate entry
//       formData.attendees.forEach((attendee) => {
//         formattedData.append('attendees', attendee);
//       });
//       if (formData.summary) formattedData.append('summary', formData.summary);
//       if (formData.notes) formattedData.append('notes', formData.notes);
//       formattedData.append('createdBy', formData.createdBy);
//       formattedData.append('status', status);
//       if (formData.signature) formattedData.append('signature', formData.signature);

//       if (editingMom && editingMom.momId) {
//         // Update mode
//         dispatch(updateProjectMeetingMom({ momId: editingMom.momId, updatedData: formattedData }))
//           .unwrap()
//           .then(() => {
//             toast.success('Meeting minute updated successfully');
//             onOpenChange(false);
//           })
//           .catch((error) => {
//             toast.error(error || 'Failed to update meeting minute');
//           });
//       } else {
//         // Create mode
//         dispatch(createProjectMeetingMom(formattedData))
//           .unwrap()
//           .then(() => {
//             toast.success('Meeting minute created successfully');
//             onOpenChange(false);
//           })
//           .catch((error) => {
//             toast.error(error || 'Failed to create meeting minute');
//           });
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setFormErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData((prev) => ({ ...prev, signature: file }));
//   };

//   const handleAddAttendee = () => {
//     if (newAttendee.trim()) {
//       setFormData((prev) => ({
//         ...prev,
//         attendees: [...prev.attendees, newAttendee.trim()],
//       }));
//       setNewAttendee('');
//       setFormErrors((prev) => ({ ...prev, attendees: '' }));
//     }
//   };

//   const handleRemoveAttendee = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       attendees: prev.attendees.filter((_, i) => i !== index),
//     }));
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-6">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold">{editingMom ? 'Edit Meeting Minute' : 'Create Meeting Minute'}</DialogTitle>
//         </DialogHeader>
//         {selectedMomLoading && <div className="text-center text-gray-500">Loading...</div>}
//         {selectedMomError && <div className="text-center text-red-500 mb-4">{selectedMomError}</div>}
//         <form className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Project Name</label>
//             <Input
//               name="projectName"
//               value={formData.projectName}
//               onChange={handleInputChange}
//               disabled
//               className="bg-gray-100 cursor-not-allowed"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Title</label>
//             <Input
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               className={formErrors.title ? 'border-red-500' : ''}
//             />
//             {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Agenda</label>
//             <Input
//               name="agenda"
//               value={formData.agenda}
//               onChange={handleInputChange}
//               className={formErrors.agenda ? 'border-red-500' : ''}
//             />
//             {formErrors.agenda && <p className="text-red-500 text-xs mt-1">{formErrors.agenda}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Meeting Mode</label>
//             <Select
//               value={formData.meetingMode}
//               onValueChange={(value) => setFormData((prev) => ({ ...prev, meetingMode: value }))}
//             >
//               <SelectTrigger className="w-full">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="online">Online</SelectItem>
//                 <SelectItem value="offline">Offline</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           {formData.meetingMode === 'online' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Meeting ID</label>
//               <Input
//                 name="meetingId"
//                 value={formData.meetingId}
//                 onChange={handleInputChange}
//                 className={formErrors.meetingId ? 'border-red-500' : ''}
//               />
//               {formErrors.meetingId && <p className="text-red-500 text-xs mt-1">{formErrors.meetingId}</p>}
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Meeting Date</label>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className={cn(
//                     'w-full justify-start text-left font-normal',
//                     !formData.meetingDate && 'text-muted-foreground',
//                     formErrors.meetingDate && 'border-red-500'
//                   )}
//                 >
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {formData.meetingDate ? format(formData.meetingDate, 'PPP') : <span>Pick a date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="single"
//                   selected={formData.meetingDate}
//                   onSelect={(date) => {
//                     setFormData((prev) => ({ ...prev, meetingDate: date }));
//                     setFormErrors((prev) => ({ ...prev, meetingDate: '' }));
//                   }}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//             {formErrors.meetingDate && <p className="text-red-500 text-xs mt-1">{formErrors.meetingDate}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Start Time</label>
//             <Input
//               type="time"
//               name="startTime"
//               value={formData.startTime}
//               onChange={handleInputChange}
//               className={formErrors.startTime ? 'border-red-500' : ''}
//             />
//             {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Duration</label>
//             <Input
//               name="duration"
//               value={formData.duration}
//               onChange={handleInputChange}
//               placeholder="e.g., 1 hour"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Attendees</label>
//             <div className="flex gap-2">
//               <Input
//                 value={newAttendee}
//                 onChange={(e) => setNewAttendee(e.target.value)}
//                 placeholder="e.g., John Doe"
//                 className={formErrors.attendees ? 'border-red-500' : ''}
//               />
//               <Button
//                 type="button"
//                 onClick={handleAddAttendee}
//                 className="bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Add
//               </Button>
//             </div>
//             {formErrors.attendees && <p className="text-red-500 text-xs mt-1">{formErrors.attendees}</p>}
//             <div className="mt-2 flex flex-wrap gap-2">
//               {formData.attendees.map((attendee, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
//                 >
//                   {attendee}
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleRemoveAttendee(index)}
//                     className="p-1"
//                   >
//                     <X className="h-4 w-4 text-red-500" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Summary</label>
//             <Input
//               name="summary"
//               value={formData.summary}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Notes</label>
//             <Input
//               name="notes"
//               value={formData.notes}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Signature</label>
//             <Input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//             />
//             {formData.signatureUrl && (
//               <p className="text-sm text-gray-500 mt-1">
//                 Current: <a href={formData.signatureUrl} target="_blank" rel="noopener noreferrer">View Signature</a>
//               </p>
//             )}
//           </div>
//         </form>
//         <DialogFooter className="flex justify-end gap-2">
//           <Button
//             variant="outline"
//             onClick={onOpenChange}
//             className="border-gray-300 text-gray-700 hover:bg-gray-100"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={(e) => handleFormSubmit(e, 'draft')}
//             className="bg-blue-600 text-white hover:bg-blue-700"
//           >
//            Draft
//           </Button>
//           <Button
//             onClick={(e) => handleFormSubmit(e, 'final')}
//             className="bg-green-600 text-white hover:bg-green-700"
//           >
//             Save 
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default MomForm;







import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMeetingMomById, createProjectMeetingMom, updateProjectMeetingMom, fetchAllProjectMoms } from '@/features/projectmeetingmomSlice';

const MomForm = ({ open, onOpenChange, selectedMom, selectedMomLoading, selectedMomError, editingMom, currentUser, projectName, projectId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    projectName: projectName || '',
    projectId: projectId || '',
    agenda: '',
    meetingMode: 'offline',
    meetingId: '',
    title: '',
    meetingDate: null,
    startTime: '',
    duration: '',
    attendees: [],
    summary: '',
    notes: '',
    createdBy: currentUser || '',
    status: 'draft',
    signature: null,
    signatureUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [newAttendee, setNewAttendee] = useState('');

  // Fetch MoM data when in edit mode
  useEffect(() => {
    if (editingMom && editingMom.momId) {
      dispatch(fetchMeetingMomById(editingMom.momId));
    }
  }, [editingMom, dispatch]);

  // Handle API errors
  useEffect(() => {
    if (selectedMomError) {
      toast.error(selectedMomError);
    }
  }, [selectedMomError]);

  // Autofill form when selectedMom is updated
  useEffect(() => {
    if (editingMom && selectedMom && selectedMom.data) {
      const momData = selectedMom.data;
      const meetingDate = momData.date && isValid(parseISO(momData.date)) ? parseISO(momData.date) : null;
      const startTime = momData.time || '';

      setFormData({
        projectName: projectName || momData.projectName || '',
        projectId: projectId || momData.projectId || '',
        agenda: momData.agenda || '',
        meetingMode: momData.meetingMode || 'offline',
        meetingId: momData.meetingId || '',
        title: momData.title || momData.momId || '',
        meetingDate,
        startTime,
        duration: momData.duration || '',
        attendees: Array.isArray(momData.attendees) ? momData.attendees : [],
        summary: momData.summary || '',
        notes: momData.notes || '',
        createdBy: currentUser || momData.createdBy || '',
        status: momData.status || 'draft',
        signature: null,
        signatureUrl: momData.signature || '',
      });
      setFormErrors({});
    } else if (!editingMom) {
      // Reset form for create mode
      setFormData({
        projectName: projectName || '',
        projectId: projectId || '',
        agenda: '',
        meetingMode: 'offline',
        meetingId: '',
        title: '',
        meetingDate: null,
        startTime: '',
        duration: '',
        attendees: [],
        summary: '',
        notes: '',
        createdBy: currentUser || '',
        status: 'draft',
        signature: null,
        signatureUrl: '',
      });
      setFormErrors({});
    }
  }, [editingMom, selectedMom, projectName, projectId, currentUser]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.agenda) errors.agenda = 'Agenda is required';
    if (!formData.meetingDate) errors.meetingDate = 'Meeting date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (formData.attendees.length === 0) errors.attendees = 'At least one attendee is required';
    if (formData.meetingMode === 'online' && !formData.meetingId) errors.meetingId = 'Meeting ID is required for online meetings';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e, status) => {
    e.preventDefault();
    if (validateForm()) {
      const formattedData = new FormData();
      formattedData.append('projectName', formData.projectName);
      formattedData.append('projectId', formData.projectId);
      formattedData.append('agenda', formData.agenda);
      formattedData.append('meetingMode', formData.meetingMode);
      if (formData.meetingId) formattedData.append('meetingId', formData.meetingId);
      formattedData.append('title', formData.title);
      formattedData.append('date', formData.meetingDate ? format(formData.meetingDate, 'yyyy-MM-dd') : '');
      formattedData.append('time', formData.startTime ? `${formData.startTime}:00` : '');
      if (formData.duration) formattedData.append('duration', formData.duration);
      formData.attendees.forEach((attendee) => {
        formattedData.append('attendees', attendee);
      });
      if (formData.summary) formattedData.append('summary', formData.summary);
      if (formData.notes) formattedData.append('notes', formData.notes);
      formattedData.append('createdBy', formData.createdBy);
      formattedData.append('status', status);
      if (formData.signature) formattedData.append('signature', formData.signature);
      if (editingMom && editingMom.momId) {
        formattedData.append('momId', editingMom.momId); // Explicitly append momId for update
      }

      if (editingMom && editingMom.momId) {
        // Update mode
        dispatch(updateProjectMeetingMom({ momId: editingMom.momId, updatedData: formattedData }))
          .unwrap()
          .then(() => {
            toast.success('Meeting minute updated successfully');
            dispatch(fetchAllProjectMoms(formData.projectId)); // Refresh MoM list
            onOpenChange(false);
          })
          .catch((error) => {
            toast.error(error || 'Failed to update meeting minute');
          });
      } else {
        // Create mode
        dispatch(createProjectMeetingMom(formattedData))
          .unwrap()
          .then(() => {
            toast.success('Meeting minute created successfully');
            dispatch(fetchAllProjectMoms(formData.projectId)); // Refresh MoM list
            onOpenChange(false);
          })
          .catch((error) => {
            toast.error(error || 'Failed to create meeting minute');
          });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, signature: file }));
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()],
      }));
      setNewAttendee('');
      setFormErrors((prev) => ({ ...prev, attendees: '' }));
    }
  };

  const handleRemoveAttendee = (index) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{editingMom ? 'Edit Meeting Minute' : 'Create Meeting Minute'}</DialogTitle>
        </DialogHeader>
        {selectedMomLoading && <div className="text-center text-gray-500">Loading...</div>}
        {selectedMomError && <div className="text-center text-red-500 mb-4">{selectedMomError}</div>}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <Input
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={formErrors.title ? 'border-red-500' : ''}
            />
            {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Agenda</label>
            <Input
              name="agenda"
              value={formData.agenda}
              onChange={handleInputChange}
              className={formErrors.agenda ? 'border-red-500' : ''}
            />
            {formErrors.agenda && <p className="text-red-500 text-xs mt-1">{formErrors.agenda}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Mode</label>
            <Select
              value={formData.meetingMode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, meetingMode: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.meetingMode === 'online' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting ID</label>
              <Input
                name="meetingId"
                value={formData.meetingId}
                onChange={handleInputChange}
                className={formErrors.meetingId ? 'border-red-500' : ''}
              />
              {formErrors.meetingId && <p className="text-red-500 text-xs mt-1">{formErrors.meetingId}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.meetingDate && 'text-muted-foreground',
                    formErrors.meetingDate && 'border-red-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.meetingDate ? format(formData.meetingDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.meetingDate}
                  onSelect={(date) => {
                    setFormData((prev) => ({ ...prev, meetingDate: date }));
                    setFormErrors((prev) => ({ ...prev, meetingDate: '' }));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formErrors.meetingDate && <p className="text-red-500 text-xs mt-1">{formErrors.meetingDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <Input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={formErrors.startTime ? 'border-red-500' : ''}
            />
            {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <Input
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 1 hour"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendees</label>
            <div className="flex gap-2">
              <Input
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                placeholder="e.g., John Doe"
                className={formErrors.attendees ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                onClick={handleAddAttendee}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Add
              </Button>
            </div>
            {formErrors.attendees && <p className="text-red-500 text-xs mt-1">{formErrors.attendees}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                >
                  {attendee}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttendee(index)}
                    className="p-1"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <Input
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <Input
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Signature</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.signatureUrl && (
              <p className="text-sm text-gray-500 mt-1">
                Current: <a href={formData.signatureUrl} target="_blank" rel="noopener noreferrer">View Signature</a>
              </p>
            )}
          </div>
        </form>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onOpenChange}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => handleFormSubmit(e, 'draft')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Draft
          </Button>
          <Button
            onClick={(e) => handleFormSubmit(e, 'final')}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MomForm;









