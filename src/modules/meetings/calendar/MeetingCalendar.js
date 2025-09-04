






'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock, User2, Users, Info, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { fetchAllMeetings } from '@/features/calender/meetingCalendarSlice';

// Professional, vibrant meeting-type-based color palette (aligned with SlotsManager)
const meetingColors = {
  default: { bg: 'bg-blue-300', border: 'border-blue-500', text: 'text-blue-900' },
  conference: { bg: 'bg-teal-300', border: 'border-teal-500', text: 'text-teal-900' },
  internal: { bg: 'bg-indigo-300', border: 'border-indigo-500', text: 'text-indigo-900' },
  external: { bg: 'bg-rose-300', border: 'border-rose-500', text: 'text-rose-900' },
};

// Format date for display
const formatSelectedDate = (view, date) => {
  if (view === 'day') {
    return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (view === 'month') {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

// Get days for the selected view
const getDays = (view, currentDate) => {
  const days = [];
  if (view === 'month') {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDay = new Date(start);
    firstDay.setDate(1 - firstDay.getDay());
    const lastDay = new Date(end);
    lastDay.setDate(end.getDate() + (6 - end.getDay()));
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
  } else if (view === 'week') {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
  } else if (view === 'day') {
    days.push(new Date(currentDate));
  }
  return days;
};

// Get and sort meetings for a specific day
const getMeetingsForDay = (day, meetings) => {
  return meetings
    .filter((meeting) => {
      const meetingDate = new Date(meeting.start?.dateTime);
      return meetingDate.toDateString() === day.toDateString();
    })
    .sort((a, b) => {
      const timeA = new Date(a.start?.dateTime).getTime();
      const timeB = new Date(b.start?.dateTime).getTime();
      return timeA - timeB;
    });
};

// Get year options (±3 years from current year)
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 3;
  const endYear = currentYear + 1;
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

export default function MeetingCalendar() {
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector((state) => state.meetingCalendar);
  const calendarRef = useRef();
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-25T13:11:00+05:30'));
  const [dateRange, setDateRange] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllMeetings());
  }, [dispatch]);

  useEffect(() => {
    setDateRange(formatSelectedDate(currentView, currentDate));
  }, [currentView, currentDate]);

  const handleNav = (action) => {
    const newDate = new Date(currentDate);
    if (action === 'prev') {
      if (currentView === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setDate(newDate.getDate() - (currentView === 'week' ? 7 : 1));
    } else if (action === 'next') {
      if (currentView === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else newDate.setDate(newDate.getDate() + (currentView === 'week' ? 7 : 1));
    } else if (action === 'today') {
      newDate.setTime(new Date('2025-07-25T13:11:00+05:30').getTime());
      setCurrentView('day');
    }
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setCurrentDate(new Date(day));
    setCurrentView('day');
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const days = getDays(currentView, currentDate);
  const yearOptions = getYearOptions();

  const getDayClass = (day) => {
    const dayOfWeek = day.getDay();
    if (currentView !== 'day') {
      if (dayOfWeek === 0) return 'bg-orange-100 border-orange-300'; // Sunday
      if (dayOfWeek === 6) return 'bg-purple-100 border-purple-300'; // Saturday
    }
    return 'bg-white border-gray-300';
  };

  const isToday = (day) => day.toDateString() === new Date('2025-07-25T13:11:00+05:30').toDateString();

  // Convert meetings to calendar-friendly event format
  const events = meetings.map((meeting) => {
    const meetingType = meeting.conferenceData?.conferenceSolution?.name?.toLowerCase().includes('meet')
      ? 'conference'
      : meeting.attendees?.some((a) => a.email.includes('external'))
      ? 'external'
      : 'internal';
    return {
      id: meeting.eventId?.toString() || '',
      title: meeting.summary || 'Untitled Meeting',
      start: meeting.start?.dateTime ? new Date(meeting.start.dateTime) : null,
      end: meeting.end?.dateTime ? new Date(meeting.end.dateTime) : null,
      extendedProps: {
        description: meeting.description || 'No description',
        location: meeting.conferenceData?.conferenceSolution?.name || 'N/A',
        hangoutLink: meeting.hangoutLink,
        htmlLink: meeting.htmlLink,
        attendees: meeting.attendees || [],
        organizer: meeting.hostEmail,
        timeZone: meeting.start?.timeZone,
        conferenceId: meeting.conferenceData?.conferenceId,
        conferenceIcon: meeting.conferenceData?.conferenceSolution?.iconUri,
        entryPoint: meeting.conferenceData?.entryPoints?.[0]?.uri,
        meetingType,
      },
    };
  });

  return (
    <div className="min-h-screen border-2 rounded-lg flex justify-center font-inter">
      <Card className="w-full max-w-[100vw] shadow-lg border-0 rounded-xl bg-white">
        <CardHeader className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-800 font-poppins truncate">
                  {dateRange}
                </CardTitle>
              </div>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="border border-gray-300 rounded-lg p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer w-20 sm:w-24"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-between">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('prev')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('today')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('next')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={currentView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('day')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'day' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Day
                </Button>
                <Button
                  variant={currentView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('week')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'week' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('month')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'month' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {
            loading ? (
  <div className="text-center text-gray-600 text-sm sm:text-lg font-inter">
    Loading meetings...
  </div>
          ) 
          
          
          : currentView === 'day' || currentView === 'week' ? (
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView={currentView === 'day' ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={false}
              height="auto"
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              nowIndicator={true}
              editable={true}
              selectable={true}
              events={events}
              eventClick={handleEventClick}
              eventContent={(eventInfo) => {
                const { meetingType } = eventInfo.event.extendedProps;
                return (
                  <div
                    className={cn(
                      'p-1 sm:p-2 rounded-lg text-xs xs:text-sm cursor-pointer shadow-sm',
                      meetingColors[meetingType]?.bg,
                      meetingColors[meetingType]?.border,
                      meetingColors[meetingType]?.text,
                      'hover:bg-opacity-80 transition duration-200'
                    )}
                  >
                    {eventInfo.event.title}
                  </div>
                );
              }}
            />
          ) : (
            <div
              className={cn(
                'grid gap-1 sm:gap-2 grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7'
              )}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    'text-center font-semibold text-gray-700 font-inter text-xs sm:text-sm',
                    'hidden md:block'
                  )}
                >
                  <span className="hidden sm:inline">{day}</span>
                </div>
              ))}
              {days.map((day, index) => {
                const dayMeetings = getMeetingsForDay(day, meetings);
                const meetingCount = dayMeetings.length;
                return (
                  <div
                    key={index}
                    className={cn(
                      'border p-2 sm:p-3 rounded-lg overflow-y-auto cursor-pointer',
                      getDayClass(day),
                      isToday(day) && currentView === 'day' && 'bg-green-100 border-green-300',
                      'h-32 xs:h-36 sm:h-40 md:h-44',
                      'hover:shadow-md transition-shadow duration-200'
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="text-xs xs:text-sm sm:text-base font-bold text-gray-800 mb-1 sm:mb-2 font-poppins">
                      {day.getDate()} {currentView !== 'month' && day.toLocaleString('default', { weekday: 'short' })}
                    </div>
                    <div className="text-xs xs:text-sm text-gray-600 font-inter">
                      {meetingCount} meeting{meetingCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>



      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-lg bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold font-poppins flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              {selectedEvent?.title || 'Event Details'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 sm:space-y-3 text-gray-600 font-inter text-sm sm:text-base">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div>
                    <p><strong>Start:</strong> {selectedEvent?.start?.toLocaleString()}</p>
                    <p><strong>End:</strong> {selectedEvent?.end?.toLocaleString()}</p>
                    <p><strong>Timezone:</strong> {selectedEvent?.extendedProps?.timeZone || 'Not specified'}</p>
                  </div>
                </div>
                {selectedEvent?.extendedProps?.organizer && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <p><strong>Organizer:</strong> {selectedEvent.extendedProps.organizer}</p>
                  </div>
                )}
                {selectedEvent?.extendedProps?.attendees?.length > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Attendees:</p>
                      <ul className="list-disc list-inside ml-4 space-y-0.5">
                        {selectedEvent.extendedProps.attendees.map((attendee, idx) => (
                          <li key={idx}>
                            {attendee.email}
                            {attendee.organizer && ' (Organizer)'}
                            {attendee.self && ' (You)'}
                            {` - ${attendee.responseStatus}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {selectedEvent?.extendedProps?.description && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <p className="whitespace-pre-wrap">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}
                {selectedEvent?.extendedProps?.conferenceId && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <div>
                      <p><strong>Google Meet ID:</strong> {selectedEvent.extendedProps.conferenceId}</p>
                      {selectedEvent.extendedProps.entryPoint && (
                        <a
                          href={selectedEvent.extendedProps.entryPoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full',
                      meetingColors[selectedEvent?.extendedProps?.meetingType]?.bg
                    )}
                  />
                  <p><strong>Type:</strong> {selectedEvent?.extendedProps?.meetingType}</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}