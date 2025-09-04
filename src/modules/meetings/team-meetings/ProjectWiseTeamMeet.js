
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Eye,
  CalendarDays,
  Clock,
  Users,
  Video,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProjectMeetings } from "@/features/projectmeetSlice";
import Spinner from "@/components/loader/Spinner";
import ProjectWiseTeamMeetMOMDetails from "./ProjectWiseTeamMeetMOMDetails";

const ProjectWiseTeamMeet = ({ project }) => {
  const dispatch = useDispatch();
  const projectId = project?.projectId;
  const { meetings, loading, error } = useSelector((state) => state.projectMeet);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMoMMeeting, setSelectedMoMMeeting] = useState(null);
  const meetingsPerPage = 10;

  // Fetch meetings when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchAllProjectMeetings(projectId));
    }
  }, [dispatch, projectId]);

  // Log meetings and errors for debugging
  useEffect(() => {
    if (meetings) {
      console.log("✅ Project Meetings:", meetings);
    }
    if (error) {
      console.error("❌ Error fetching meetings:", error);
    }
  }, [meetings, error]);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Ensure meetings is an array to prevent 'slice' error
  const safeMeetings = Array.isArray(meetings) ? meetings : [];
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = safeMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);
  const totalPages = Math.ceil(safeMeetings.length / meetingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full space-y-4 p-6">
  

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      )}


      {!loading && !error && safeMeetings.length === 0 && (
        <p className="text-muted-foreground">No meetings found for this project.</p>
      )}

      {!loading && !error && safeMeetings.length > 0 && (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-blue-50 text-xs text-blue-800 uppercase">
              <tr>
                <th className="p-3 border">Summary</th>
                <th className="p-3 border">Start</th>
                <th className="p-3 border">End</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMeetings.map((meeting) => (
                <tr key={meeting.eventId} className="hover:bg-gray-50">
                  <td className="p-3 border max-w-xs truncate">
                    {meeting.summary}
                  </td>
                  <td className="p-3 border whitespace-nowrap">
                    {formatDateTime(meeting.start)}
                  </td>
                  <td className="p-3 border whitespace-nowrap">
                    {formatDateTime(meeting.end)}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setSelectedMeeting(meeting)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Meeting</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setSelectedMoMMeeting(meeting)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View MoM</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => paginate(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {/* Dialog: View Meeting Details */}
      <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600">
              {selectedMeeting?.summary}
            </DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <ScrollArea className="max-h-[70vh] pr-2 space-y-3 text-sm">
              <Separator />
              <p>
                <strong>Description:</strong>{" "}
                {selectedMeeting.description || "N/A"}
              </p>
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="w-4 h-4" />
                Start: {formatDateTime(selectedMeeting.start)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                End: {formatDateTime(selectedMeeting.end)}
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Users className="w-4 h-4 mt-1" />
                <div>
                  <strong>Attendees:</strong>
                  <ul className="list-disc ml-4">
                    {selectedMeeting.attendees.length > 0 ? (
                      selectedMeeting.attendees.map((attendee) => (
                        <li key={attendee.email}>
                          {attendee.email} ({attendee.responseStatus})
                        </li>
                      ))
                    ) : (
                      <li>No attendees</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Video className="w-4 h-4" />
                <a
                  href={selectedMeeting.hangoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Join Meeting
                </a>
              </div>
              <p>
                <strong>Event ID:</strong>{" "}
                {selectedMeeting.eventId || "N/A"}
              </p>
              <p>
                <strong>Calendar Link:</strong>{" "}
                <a
                  href={selectedMeeting.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open in Calendar
                </a>
              </p>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: View MoM Details */}
      <Dialog open={!!selectedMoMMeeting} onOpenChange={() => setSelectedMoMMeeting(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600">
              MoM for: {selectedMoMMeeting?.summary}
            </DialogTitle>
          </DialogHeader>
          {selectedMoMMeeting && (
            <div className="max-h-[70vh] overflow-y-auto">
              <ProjectWiseTeamMeetMOMDetails
                project={project}
                meeting={selectedMoMMeeting}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectWiseTeamMeet;