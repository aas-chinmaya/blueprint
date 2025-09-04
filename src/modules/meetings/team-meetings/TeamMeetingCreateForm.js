



'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Clock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

import { fetchAllSlots } from '@/features/master/slotMasterSlice';
import { useLoggedinUser } from '@/hooks/useLoggedinUser';
import { getTeamMeetingData } from '@/features/projectteammeetingSlice';
import { createProjectMeeting } from '@/features/projectmeetSlice';

const TIME_ZONE = 'Asia/Kolkata';

const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(':');
  const date = new Date();
  date.setHours(+hour, +minute);
  return format(date, 'hh:mm a');
};

const formatSlotTime = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const formatSelectedDate = (date) => {
  return format(toZonedTime(date, TIME_ZONE), 'EEEE, MMMM d, yyyy', { timeZone: TIME_ZONE });
};

export default function TeamMeetingCreateForm({ projectId, teamLeadId,onSubmit }) {
  const { currentUser } = useLoggedinUser();
  const dispatch = useDispatch();
  const { slots, loading, error } = useSelector((state) => state.slots);
  const { teamMeetingLoading, teamMeetingError, currentTeamMeeting } = useSelector(
    (state) => state.projectTeamMeeting
  );
  const { meetingLoading, meetingError } = useSelector((state) => state.meetings); // Assuming 'meetings' slice

  const initialDate = new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [form, setForm] = useState({
    // email: "it_pujarini@outlook.com",
    email: "it_chinmaya@outlook.com",
    // email: currentUser?.email || '',
    summary: '',
    description: '',
    attendees: [],
    selectedSlot: null,
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(getTeamMeetingData({ projectId, teamLeadId }))
      .unwrap()
      .then((data) => {
        console.log('✅ Team Meeting Data:', data);
        setForm((prev) => ({
          ...prev,
          attendees: data.emails || [],
        }));
      })
      .catch((err) => console.error('❌ Error fetching team meeting data:', err));
  }, [dispatch, projectId, teamLeadId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
    setSuccessMessage('');
  };

  const handleSlotChange = (slotId) => {
    const selected = slots?.find((s) => s._id === slotId);
    if (selected) {
      setForm((prev) => ({ ...prev, selectedSlot: selected }));
      setFormError('');
      setSuccessMessage('');
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formatted = format(toZonedTime(date, TIME_ZONE), 'yyyy-MM-dd', {
      timeZone: TIME_ZONE,
    });
    dispatch(fetchAllSlots(formatted));
  };

  const handleAttendeeToggle = (email) => {
    setForm((prev) => {
      const attendees = prev.attendees.includes(email)
        ? prev.attendees.filter((e) => e !== email)
        : [...prev.attendees, email];
      return { ...prev, attendees };
    });
    setFormError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.selectedSlot) {
      setFormError('Please select a time slot');
      return;
    }

    if (!form.email || !form.summary) {
      setFormError('Organizer email and meeting summary are required');
      return;
    }

    if (form.attendees.length === 0) {
      setFormError('At least one attendee is required');
      return;
    }

    const payload = {
      email: form.email,
      summary: form.summary,
      description: form.description,
      attendees: form.attendees.map((email) => ({ email })),
      date: format(toZonedTime(selectedDate, TIME_ZONE), 'yyyy-MM-dd', {
        timeZone: TIME_ZONE,
      }),
      selectedSlot: {
        startTime: form.selectedSlot.startTime,
        endTime: form.selectedSlot.endTime,
      },
      projectId,
    };

    try {
      const result = await dispatch(createProjectMeeting(payload)).unwrap();
      setSuccessMessage('Meeting created successfully!');
      setFormError('');
      // Reset form
      setForm({
        email: currentUser?.email || '',
        summary: '',
        description: '',
        attendees: currentTeamMeeting?.emails || [],
        selectedSlot: null,
      });
      onSubmit()
      setSelectedDate(new Date()); // Reset date
    } catch (error) {
      setFormError(error?.message || 'Failed to create meeting. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleCancel = () => {
    setForm({
      email: currentUser?.email || '',
      summary: '',
      description: '',
      attendees: currentTeamMeeting?.emails || [],
      selectedSlot: null,
    });
    setSelectedDate(new Date());
    setFormError('');
    setSuccessMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">


      {/* Date & Slot Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-green-800">Choose Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-left font-normal w-full">
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-green-800 flex gap-2 items-center">
            <Clock className="w-4 h-4" />
            Choose Time Slot
          </Label>
          <Select onValueChange={handleSlotChange} value={form.selectedSlot?._id || ''}>
            <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Select slot" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled>Error loading slots</SelectItem>
              ) : !slots || slots.length === 0 ? (
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
      </div>

      {/* Organizer Email */}
      <div>
        <Label className="text-green-800">Organizer Email</Label>
        <Input
          name="email"
          type="email"
          value={form.email}
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Meeting Title */}
      <div>
        <Label className="text-green-800">Meeting Title</Label>
        <Input name="summary" value={form.summary} onChange={handleChange} required />
      </div>

      {/* Attendees Selection */}
      <div>
        <Label className="text-green-800">Attendees</Label>
        <div className="mt-2 space-y-2">
          {currentTeamMeeting?.emails?.length > 0 ? (
            currentTeamMeeting.emails.map((email) => (
              <div key={email} className="flex items-center gap-2">
                <Checkbox
                  id={email}
                  checked={form.attendees.includes(email)}
                  onCheckedChange={() => handleAttendeeToggle(email)}
                />
                <Label htmlFor={email} className="text-sm">
                  {email}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No team members available</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-green-800">Description</Label>
        <Textarea name="description" value={form.description} onChange={handleChange} />
      </div>

    

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading || teamMeetingLoading || meetingLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || teamMeetingLoading || meetingLoading}>
          {loading || teamMeetingLoading || meetingLoading ? 'Scheduling...' : 'Schedule Meeting'}
        </Button>
      </div>
    </form>
  );
}