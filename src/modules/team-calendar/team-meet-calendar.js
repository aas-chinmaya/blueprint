


'use client';

import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, List as ListIcon,
  CalendarDays, Clock, User2, Users, Info, Video,
  Eye
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamMeetings, createTeamMeeting } from '@/features/calender/teammeetingCalenderSlice';
import { formatRange } from '@/utils/formatDate';
import TeamMeetingCreateForm from '@/modules/meetings/team-meetings/TeamMeetingCreateForm';
import { useLoggedinUser } from '@/hooks/useLoggedinUser';
import ViewEventModal from './ViewEventModal';

export default function TeamMeetingCalendar() {
  const dispatch = useDispatch();
  const calendarRef = useRef();
const {currentUser} = useLoggedinUser();
console.log(currentUser)
  const { teamMeetings, loading } = useSelector((state) => state.teamMeetings);

  useEffect(() => {
    const email = 'it_pujarini@outlook.com';
    dispatch(fetchTeamMeetings(email));
  }, [dispatch]);

  // const email =currentUser?.email;

  // useEffect(() => {
  //   dispatch(fetchTeamMeetings(email));
  // }, [dispatch,email]);

  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [dateRange, setDateRange] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const handleNav = (action) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (action === 'prev') api.prev();
    if (action === 'next') api.next();
    if (action === 'today') api.today();

    updateRange(api);
  };

  const changeView = (viewName) => {
    const api = calendarRef.current?.getApi();
    api.changeView(viewName);
    setCurrentView(viewName);
    updateRange(api);
  };

  const updateRange = (api) => {
    const start = api.view.activeStart;
    const end = api.view.activeEnd;
    setDateRange(formatRange(start, end));
  };

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) updateRange(api);
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const events = teamMeetings.map((meeting) => ({
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
    },
  }));

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create Team Meeting
        </Button>
      </div>

      <Card className="!rounded-none">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b px-4 py-2">
          <div className="text-sm text-muted-foreground">{dateRange}</div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleNav('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleNav('today')}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleNav('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
              onClick={() => changeView('timeGridDay')}
            >
              Day
            </Button>
            <Button
              size="sm"
              variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
              onClick={() => changeView('timeGridWeek')}
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={currentView === 'listWeek' ? 'default' : 'outline'}
              onClick={() => changeView('listWeek')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            height="auto"
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            nowIndicator={true}
            editable={false}
            selectable={false}
            events={events}
            eventClick={handleEventClick}
            eventBackgroundColor="#22c55e"
            eventBorderColor="#15803d"
            eventTextColor="#fff"
            eventClassNames="rounded px-0 py-0.5 text-sm"
 

            //deleted
eventContent={(arg) => {
  return (
    <div className="flex items-center justify-between px-1 w-full">
      <div className="truncate">{arg.event.title}</div>
      {currentView === "listWeek" && (
        <button
          className="ml-2 p-1 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEvent(arg.event);
            setModalOpen(true);
          }}
          aria-label="View Event"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}}
          />
        </CardContent>
      </Card>


<ViewEventModal
 
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  event={selectedEvent}
/>



      {/* View Meeting Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-green-600 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {selectedEvent?.title || 'Meeting Details'}
            </DialogTitle>

            <DialogDescription asChild>
              <div className="mt-4 space-y-5 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p><strong>Start:</strong> {selectedEvent?.start?.toLocaleString()}</p>
                    <p><strong>End:</strong> {selectedEvent?.end?.toLocaleString()}</p>
                    <p><strong>Timezone:</strong> {selectedEvent?.extendedProps?.timeZone || 'N/A'}</p>
                  </div>
                </div>

                {selectedEvent?.extendedProps?.organizer && (
                  <div className="flex gap-3">
                    <User2 className="w-5 h-5 text-primary mt-0.5" />
                    <p><strong>Organizer:</strong> {selectedEvent.extendedProps.organizer}</p>
                  </div>
                )}

                {selectedEvent?.extendedProps?.attendees?.length > 0 && (
                  <div className="flex gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Attendees:</p>
                      <ul className="list-disc list-inside ml-4 space-y-0.5">
                        {selectedEvent.extendedProps.attendees.map((att, i) => (
                          <li key={i}>
                            {att.email}
                            {att.organizer && ' (Organizer)'}
                            {att.self && ' (You)'} — {att.responseStatus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedEvent?.extendedProps?.description && (
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <p className="whitespace-pre-wrap">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}

                {selectedEvent?.extendedProps?.conferenceId && (
                  <div className="flex gap-3">
                    <Video className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p><strong>Google Meet ID:</strong> {selectedEvent.extendedProps.conferenceId}</p>
                      {selectedEvent.extendedProps.entryPoint && (
                        <a
                          href={selectedEvent.extendedProps.entryPoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 underline hover:text-green-800"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-7xl rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle>Create New Team Meeting</DialogTitle>
          </DialogHeader>
          <TeamMeetingCreateForm
            onSubmit={async (payload) => {
              try {
                await dispatch(createTeamMeeting(payload)).unwrap();
                setIsCreateDialogOpen(false);
              } catch (err) {
                console.error('Create error:', err);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

