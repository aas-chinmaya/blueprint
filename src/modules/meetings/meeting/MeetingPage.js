
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMeetingsByContactId,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  clearError,
} from "@/features/meetingSlice";
import { fetchAllSlots } from "@/features/master/slotMasterSlice";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Pencil,
  Eye,
  Trash2,
  Plus,
  Search,
  FileText,
  MessageSquare,
  Tag,
  CheckCircle,
  User as UserIcon,
  Link,
  Loader2,
  X,
  Download,
  ExternalLink,
  FileCheck,
  FileEdit,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import { format, isWithinInterval, parseISO, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import CodeVerificationModal from "./MeetcodeModal";
import { DialogDescription } from "@radix-ui/react-dialog";
import { toast } from 'sonner';
import MeetingDetailsWithMOM from "../mom/MeetingDetailsWithMOM";
import { fetchMoM } from '@/features/momSlice';
import { useRouter } from "next/navigation";


// Utility functions with Asia/Kolkata time zone
const TIME_ZONE = "Asia/Kolkata";

const toDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = toZonedTime(new Date(isoString), TIME_ZONE);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toISOWithOffset = (dateTimeLocal) => {
  if (!dateTimeLocal) return "";
  // Parse local date-time string in Asia/Kolkata
  const date = parse(dateTimeLocal, "yyyy-MM-dd'T'HH:mm", new Date());
  // Convert to UTC ISO string
  return date.toISOString();
};

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = toZonedTime(new Date(isoString), TIME_ZONE);
  return format(date, "MMM d, yyyy", { timeZone: TIME_ZONE });
};

const formatTimes = (isoString) => {
  if (!isoString) return "N/A";
  const date = toZonedTime(new Date(isoString), TIME_ZONE);
  return format(date, "h:mm a", { timeZone: TIME_ZONE });
};

const getInitials = (email) => {
  if (!email) return "?";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[.\-_]/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return format(toZonedTime(date, TIME_ZONE), "h:mm a", { timeZone: TIME_ZONE });
};

const formatSlotTime = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const formatSelectedDate = (date) => {
  return format(toZonedTime(date, TIME_ZONE), "EEEE, MMMM d, yyyy", { timeZone: TIME_ZONE });
};

// MeetingForm Component
function MeetingForm({ meeting = {}, onSave, onCancel, isEditing = false, loading = false }) {
  const dispatch = useDispatch();
  const { slots, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  const [selectedDate, setSelectedDate] = useState(
    meeting.start ? toZonedTime(new Date(meeting.start.dateTime), TIME_ZONE) : new Date()
  );
  const [formData, setFormData] = useState({
    eventId: meeting.meetingId || "",
    email: meeting.email ,
    summary: meeting.title || "New Meeting",
    description: meeting.agenda || "",
    attendees: Array.isArray(meeting.attendees)
      ? meeting.attendees.map((a) => a.email).join(", ")
      : "",
    selectedSlot: null,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(toZonedTime(selectedDate, TIME_ZONE), "yyyy-MM-dd", {
        timeZone: TIME_ZONE,
      });
      dispatch(fetchAllSlots(formattedDate));
    }
  }, [selectedDate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSlotChange = (slotId) => {
    const selected = slots.find((s) => s._id === slotId);
    if (selected) {
      setFormData({ ...formData, selectedSlot: selected });
      setFormError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.selectedSlot) {
      setFormError("Please select a time slot");
      return;
    }

    if (!formData.email || !formData.summary) {
      setFormError("Organizer email and meeting summary are required");
      return;
    }

    const payload = {
      email: formData.email,
      summary: formData.summary,
      description: formData.description,
      attendees: formData.attendees
        .split(",")
        .map((email) => ({ email: email.trim() }))
        .filter((a) => a.email),
      eventId: formData.eventId,
      date: format(toZonedTime(selectedDate, TIME_ZONE), "yyyy-MM-dd", {
        timeZone: TIME_ZONE,
      }),
      selectedSlot: {   startTime: formData.selectedSlot.startTime,
      endTime: formData.selectedSlot.endTime, },
    };

    onSave(payload);
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg">
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-blue-800 font-medium mb-2 block">Select Date</Label>
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <CalendarComponent
                  mode="single"
                 
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                  className="rounded-md "
                />
              </CardContent>
            </Card>
        
            <Label className="text-blue-800 font-medium mt-4 block flex items-center gap-2">
              <Clock className="w-4 h-4" /> Select Time Slot
            </Label>
            <Select onValueChange={handleSlotChange} value={formData.selectedSlot?._id || ""}>
              <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {slotsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : slotsError ? (
                  <SelectItem value="error" disabled>Error loading slots</SelectItem>
                ) : slots.length === 0 ? (
                  <SelectItem value="no-slots" disabled>No slots available</SelectItem>
                ) : (
                  slots.map((slot) => (
                    <SelectItem key={slot._id} value={slot._id}>
                      {formatSlotTime(slot.startTime, slot.endTime)} ({slot.shift})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-blue-800 font-medium">Organizer Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="summary" className="text-blue-800 font-medium">Meeting Summary</Label>
              <Input
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="attendees" className="text-blue-800 font-medium">
                Attendee Emails (comma-separated)
              </Label>
              <Input
                id="attendees"
                name="attendees"
                value={formData.attendees}
                onChange={handleChange}
                placeholder="email1@example.com, email2@example.com"
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-blue-800 font-medium">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-md p-2"
                rows={4}
                placeholder="Add meeting agenda or description..."
              />
            </div>
          </div>
        </div>
      
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            disabled={loading || slotsLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedDate || !formData.selectedSlot || slotsLoading}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {loading ? "Saving..." : isEditing ? "Update Meeting" : "Schedule Meeting"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// MeetingDetails Component
function MeetingDetails({ meeting, onClose }) {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl shadow-md w-full max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-blue-800">{meeting.title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3 text-blue-700">
          <CalendarIcon className="h-5 w-5" />
          <span className="font-medium">{formatDate(meeting.date)}</span>
        </div>
        <div className="flex items-center space-x-3 text-blue-700">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            {formatTimes(meeting.start?.dateTime)} - {formatTimes(meeting.end?.dateTime)}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-blue-700">
          <MapPin className="h-5 w-5" />
          {meeting.hangoutLink ? (
            <a
              href={meeting.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-900"
            >
              Google Meet
            </a>
          ) : (
            <span className="font-medium">Online</span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-blue-700">
          <Users className="h-5 w-5" />
          <div className="flex space-x-2">
            {meeting.attendees?.length > 0 ? (
              meeting.attendees.split(",").map((email, idx) => (
                <div key={idx} className="relative group">
                  <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-semibold flex items-center justify-center cursor-default select-none">
                    {getInitials(email.trim())}
                  </div>
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-blue-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap pointer-events-none transition-opacity duration-300 z-10">
                    {email.trim()}
                  </span>
                </div>
              ))
            ) : (
              <span className="font-medium">None</span>
            )}
          </div>
        </div>
      </div>
      {meeting.hangoutLink && (
        <div className="flex items-center space-x-4 p-4 bg-white border border-blue-200 rounded-lg">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
            <Link className="h-6 w-6 text-blue-800" />
          </div>
          <div className="flex flex-col">
            <span className="text-blue-800 font-semibold">Join Google Meet</span>
            <a
              href={meeting.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {meeting.hangoutLink}
            </a>
          </div>
        </div>
      )}
      {meeting?.agenda && (
        <div className="p-4 bg-white border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Description</h4>
          <p className="text-blue-700 whitespace-pre-wrap">{meeting.agenda}</p>
        </div>
      )}
    </div>
  );
};



import MeetingAccessGate from '@/modules/meetings/meetingAccessController/MeetingAccessGate'; // Import the new component
import { email } from "@/constants/constants";





import { deletePaymentLink, verifyStatusCode } from '@/features/meeting/paymentSlice'; // Import the async thunk
import { usePaymentStatus } from "@/hooks/usePaymentStatus";



function MeetingsPage({ id }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const contactId = id;
       const contactEmail = useSelector(state => state.user?.employeeData?.email);

  const {
    contactMeetings,
    contactMeetingsLoading,
    contactMeetingsError,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useSelector((state) => state.meetings)
  const { paymentStatus, paymentError } = useSelector((state) => state.payment)
  const [modalState, setModalState] = useState(null)
  const [meetingsData, setMeetingsData] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [meetingToDelete, setMeetingToDelete] = useState(null)
  const paidUser=usePaymentStatus(contactId)
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const FREE_MEETING_LIMIT = 3
  const TIME_ZONE = 'UTC'

  // Verify payment status on mount and when payment gate modal closes
  useEffect(() => {
    if (contactId) {
      dispatch(verifyStatusCode(contactId))
    }
  }, [contactId, modalState, dispatch])

  // Update isPaidUser based on payment status
  useEffect(() => {
    setIsPaidUser(paidUser === 'yes')
  }, [paidUser])

  // Fetch meetings
  useEffect(() => {
    if (contactId) {
      dispatch(fetchMeetingsByContactId(contactId))
    }
  }, [contactId, dispatch])

  // Map meetings data
  useEffect(() => {
    if (contactMeetings.length > 0) {
      const mappedMeetings = contactMeetings.map((meeting) => ({
        meetingId: meeting.id,
        title: meeting.summary || 'Untitled',
        date: meeting.start?.dateTime || new Date().toISOString(),
        location: meeting.hangoutLink || 'N/A',
        attendees: meeting.attendees?.map((attendee) => attendee.email).join(', ') || '',
        agenda: meeting.description || '',
        mom: meeting.mom || [],
        start: meeting.start,
        end: meeting.end,
        hangoutLink: meeting.hangoutLink,
      }))
      setMeetingsData(mappedMeetings)
    } else {
      setMeetingsData([])
    }
  }, [contactMeetings])

  // const handleCreate = async (newMeeting) => {
  //   try {
  //     await dispatch(createMeeting(newMeeting)).unwrap()
  //     setModalState(null)
  //     toast.success('Meeting created successfully!')
  //   } catch (error) {
  //     if (error?.response?.data?.message === 'User not authorized') {
  //       setModalState('paymentGate')
  //     } else {
  //       toast.error('Failed to create meeting.')
  //       console.error('Error creating meeting:', error)
  //     }
  //   }
  // }

  
const handleCreate = async (newMeeting) => {
  try {
    // Step 1: Create the meeting
    await dispatch(createMeeting(newMeeting)).unwrap();
    console.log('Meeting created successfully:', newMeeting);

    // Step 2: Verify payment status
    const verifyResult = await dispatch(verifyStatusCode(contactId)).unwrap();
    console.log('Payment status verified:', verifyResult);

    // Set boolean flag based on verifyStatusCode response
    const hasPaymentRecord = verifyResult && verifyResult.status !== 'unpaid';
    console.log('Has payment record:', hasPaymentRecord);

    // Step 3: Delete payment link if a valid record exists
    if (hasPaymentRecord) {
      await dispatch(deletePaymentLink(contactId)).unwrap();
      console.log('Payment link deleted successfully');
    } else {
      console.log('No valid payment record found, skipping delete payment link');
    }

    // Show success toast only after all steps are completed
    setModalState(null);
    toast.success('Meeting created successfully!');
  } catch (error) {
    if (error?.response?.data?.message === 'User not authorized') {
      setModalState('paymentGate');
    } else {
      toast.error('Failed to create meeting.');
      console.error('Error during meeting creation process:', error);
    }
  }
};




  const handleEdit = async (updatedMeeting) => {
    try {
      await dispatch(updateMeeting({ meetingData: updatedMeeting })).unwrap()
      setModalState(null)
      setSelectedMeeting(null)
      toast.success('Meeting updated successfully!')
    } catch (error) {
      toast.error('Failed to update meeting.')
      console.error('Error updating meeting:', error)
    }
  }

  const handleDelete = async (meetingId) => {
    setMeetingToDelete(meetingId)
    setModalState('deleteConfirm')
  }

  const confirmDelete = async () => {
    if (meetingToDelete) {
      try {
        await dispatch(deleteMeeting({ id: meetingToDelete,email:email })).unwrap()
        toast.success('Meeting deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete meeting.')
        console.error('Error deleting meeting:', error)
      } finally {
        setModalState(null)
        setMeetingToDelete(null)
      }
    }
  }

  const handleView = (meeting) => {
    setSelectedMeeting(meeting)
    setModalState('view')
  }

  const handleViewMom = (meeting) => {
    setSelectedMeeting(meeting)
    setModalState('viewMom')
  }

  const handleCloseModals = () => {
    setModalState(null)
    setSelectedMeeting(null)
    dispatch(clearError())
  }

  const handleScheduleClick = () => {
    if (meetingsData.length >= FREE_MEETING_LIMIT && !isPaidUser) {
      setModalState('paymentGate')
    } else {
      setModalState('create')
    }
  }

  const resetDateRange = () => {
    setDateRange({ from: null, to: null })
  }

  const formatDate = (date) => {
    return date ? format(new Date(date), 'PPP') : 'N/A'
  }

  const formatTimes = (dateTime) => {
    return dateTime ? format(new Date(dateTime), 'p') : 'N/A'
  }

  const filteredMeetings = meetingsData.filter((meeting) => {
    const matchesSearch = meeting.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const meetingDate = meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : ''
    const matchesDateRange =
      !dateRange.from ||
      !dateRange.to ||
      (meetingDate &&
        isWithinInterval(parseISO(meetingDate), {
          start: dateRange.from,
          end: dateRange.to,
        }))
    return matchesSearch && matchesDateRange
  })

  const remainingFreeMeetings = Math.max(0, FREE_MEETING_LIMIT - meetingsData.length)

  return (
  
      <Card className="">
        <CardHeader className="">
          <CardTitle className="flex justify-between items-center text-blue-800">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6" />
              <span className="text-2xl font-bold">Meetings for Contact ID: {id}</span>
            </div>
            <div className="relative group">
              <Button
                className="bg-blue-700 hover:bg-blue-800 text-white"
                onClick={handleScheduleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              {!isPaidUser && (
                <div
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md transition-opacity z-50 pointer-events-none ${
                    showTooltip ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {remainingFreeMeetings > 0
                    ? `${remainingFreeMeetings} free meeting${remainingFreeMeetings === 1 ? '' : 's'} remaining`
                    : 'Free tier limit reached. Upgrade to schedule more.'}
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {contactMeetingsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{contactMeetingsError}</AlertDescription>
            </Alert>
          )}
          {paymentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input
                placeholder="Search by meeting title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-blue-300 focus:ring-blue-500 text-blue-900 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg"
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`
                      : 'Select Date Range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetDateRange}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          <div className="bg-white min-h-screen rounded-lg border border-blue-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white
 ">
                  <TableHead className=" font-semibold text-white">Title</TableHead>
                  <TableHead className=" font-semibold text-white">Date</TableHead>
                  <TableHead className=" font-semibold text-white">Time</TableHead>
                  <TableHead className=" font-semibold text-white">Link</TableHead>
                  <TableHead className=" font-semibold text-white">Attendees</TableHead>
                  <TableHead className=" font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactMeetingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <span className="text-blue-700">Loading meetings...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-blue-700">No meetings found.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.meetingId} className="hover:bg-blue-50">
                      <TableCell className="font-medium text-blue-800">{meeting.title}</TableCell>
                      <TableCell className="text-blue-700">{formatDate(meeting.date)}</TableCell>
                      <TableCell className="text-blue-700">
                        {formatTimes(meeting.start?.dateTime)} - {formatTimes(meeting.end?.dateTime)}
                      </TableCell>
                      <TableCell className="text-blue-700">
                        {meeting.hangoutLink ? (
                          <a
                            href={meeting.hangoutLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                          >
                            Join 
                          </a>
                        ) : (
                          'Online'
                        )}
                      </TableCell>
                      <TableCell className="text-blue-700">
                        {meeting.attendees
                          ? `${meeting.attendees.split(', ').length} attendees`
                          : 'None'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 items-center">
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(meeting)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                              View Meeting
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMeeting(meeting)
                                setModalState('edit')
                              }}
                              className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                              Reschedule
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(meeting.meetingId)}
                              disabled={deleteLoading}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                              Delete Meeting
                            </div>
                          </div>
                        
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMom(meeting)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                              View MOM
                            </div>
                          </div>
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/quotation/create?meetingId=${meeting?.meetingId}&contactId=${contactId}`
                                )
                              }
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition z-50 pointer-events-none">
                              Create Quotation
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Dialog open={modalState === 'create'} onOpenChange={(open) => setModalState(open ? 'create' : null)}>
            <DialogContent className="min-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-blue-800">Create New Meeting</DialogTitle>
              </DialogHeader>
              <MeetingForm
                onSave={handleCreate}
                onCancel={handleCloseModals}
                loading={createLoading}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={modalState === 'edit'} onOpenChange={(open) => setModalState(open ? 'edit' : null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-blue-800">Edit Meeting</DialogTitle>
              </DialogHeader>
              {selectedMeeting && (
                <MeetingForm
                  meeting={selectedMeeting}
                  onSave={handleEdit}
                  onCancel={handleCloseModals}
                  isEditing={true}
                  loading={updateLoading}
                />
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={modalState === 'view'} onOpenChange={(open) => setModalState(open ? 'view' : null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-blue-800">Meeting Details</DialogTitle>
              </DialogHeader>
            
                                {selectedMeeting && (
                  <Card className="w-full max-w-2xl mx-auto shadow-md border-blue-200 bg-white">
                   

                    <CardContent className="space-y-6 pt-6 text-sm text-gray-800">

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Date</p>
                            <p className="text-base font-medium">{formatDate(selectedMeeting.date)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Time</p>
                            <p className="text-base font-medium">
                              {formatTimes(selectedMeeting.start?.dateTime)} – {formatTimes(selectedMeeting.end?.dateTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Location</p>
                      <a
                        href={selectedMeeting.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-blue-700 underline hover:text-blue-900 transition-colors"
                      >
                        {selectedMeeting.location}
                      </a>
                    </div>
                  </div>


                      {/* Attendees */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <p className="text-xs text-gray-500 uppercase">Attendees</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedMeeting.attendees
                            ? selectedMeeting.attendees
                                .split(',')
                                .map((email, index) => {
                                  const trimmed = email.trim()
                                  return (
                                  <div
                    key={index}
                    title={trimmed}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-sm font-semibold hover:bg-blue-200 cursor-pointer"
                  >
                    {trimmed[0]?.toUpperCase()}
                  </div>

                                  )
                                })
                            : <span className="text-gray-400 text-xs italic">None</span>}
                        </div>
                      </div>

                      {/* Agenda */}
                      <div className="flex items-start gap-3">
                        <ClipboardList className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Agenda</p>
                          <p className="text-base font-medium">
                            {selectedMeeting.agenda || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  )}

            </DialogContent>
          </Dialog>


          
          <Dialog open={modalState === 'deleteConfirm'} onOpenChange={(open) => setModalState(open ? 'deleteConfirm' : null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this meeting? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModalState(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={modalState === 'viewMom'} onOpenChange={(open) => setModalState(open ? 'viewMom' : null)}>
            <DialogContent className="min-w-[60vw] h-[90vh] max-w-7xl p-6 overflow-y-auto">
              <MeetingDetailsWithMOM
                isOpen={modalState === 'viewMom'}
                onClose={handleCloseModals}
                meeting={selectedMeeting}
                TIME_ZONE={TIME_ZONE}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={modalState === 'paymentGate'} onOpenChange={(open) => setModalState(open ? 'paymentGate' : null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-800">Meeting Limit Reached</DialogTitle>
                <DialogDescription>
                  Contact have reached the free tier limit of {FREE_MEETING_LIMIT} meetings. Please Send Payment Link to schedule more meetings.
                </DialogDescription>
              </DialogHeader>
              <MeetingAccessGate
                contactId={contactId}
                contactEmail={contactEmail}
                onCancel={handleCloseModals}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    
  )
}

export default MeetingsPage























