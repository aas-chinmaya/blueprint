


'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjectById,
  changeProjectStatus,
  resetSuccessMessage,
} from "@/features/projectSlice";
import {
  FiArrowLeft,
  FiDownload,
  FiPlus,
  FiUsers,
  FiList,
  FiFileText,
  FiInfo,
  FiCalendar,
  FiUser,
  FiEdit,
  FiPaperclip,
} from "react-icons/fi";
import { Briefcase, TrendingUp, FileStack, BugIcon, CheckCircle, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import ViewTeamByProjectId from "@/modules/team/viewTeamByProjectId";
import CreateTeamForm from "@/modules/team/createTeam";
import AllTaskListByProjectId from "@/modules/task/AllTaskListByProjectId";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LuFolderClock } from "react-icons/lu";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
// import TeamMeetingCreateForm from "../meetings/team-meetings/TeamMeetingCreateForm";
// import ProjectWiseTeamMeet from "../meetings/team-meetings/ProjectWiseTeamMeet";
import ProjectWisebugList from "../bug/ProjectWisebugList";
import Spinner from "@/components/loader/Spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ProjectwiseAllMeetingAndMom from "../meetings/project/ProjectwiseAllmeetingMom";

export default function ViewProjectById({ projectId }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { project, status, error, successMessage } = useSelector(
    (state) => state.project
  );
  const [activeTab, setActiveTab] = useState("details");
  const [newStatus, setNewStatus] = useState("");
  const [statusUpdateMessage, setStatusUpdateMessage] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false); // Renamed for clarity
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false); // New state for meeting modal
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasFetchedAfterStatusChange, setHasFetchedAfterStatusChange] =
    useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const { currentUser, isTeamLead } = useCurrentUser(project?.data?.teamLeadId);

  useEffect(() => {
    if (successMessage && !hasFetchedAfterStatusChange) {
      setStatusUpdateMessage(successMessage);
      setHasFetchedAfterStatusChange(true);
      dispatch(fetchProjectById(projectId));
      setNewStatus("");
      setTimeout(() => {
        setStatusUpdateMessage("");
        dispatch(resetSuccessMessage());
        setHasFetchedAfterStatusChange(false);
      }, 3000);
    }
    if (error.statusChange) {
      setStatusUpdateMessage(error.statusChange);
      setTimeout(() => setStatusUpdateMessage(""), 3000);
    }
  }, [
    successMessage,
    error.statusChange,
    dispatch,
    projectId,
    hasFetchedAfterStatusChange,
  ]);

  const handleDownload = (url, filename) => {
    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handleStatusSubmit = () => {
    if (newStatus) {
      setIsStatusModalOpen(false);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmStatusChange = () => {
    if (newStatus && projectId) {
      dispatch(changeProjectStatus({ projectId, status: newStatus }));
      setIsConfirmModalOpen(false);
      toast.success("Status Updated!");
    }
  };

  const statusOptions = ["In Progress", "Completed"];

  const tabs = [
    {
      id: "details",
      label: "Details",
      icon: <FiInfo className="h-5 w-5" />,
    },
    {
      id: "team",
      label: "Team",
      icon: <FiUsers className="h-5 w-5" />,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <FiList className="h-5 w-5" />,
    },
    // {
    //   id: "meeting",
    //   label: "Meeting",
    //   icon: <FiUsers className="h-5 w-5" />,
    // },
    {
      id: "bug",
      label: "Bug",
      icon: <BugIcon className="h-5 w-5" />,
    },
    {
      id: "meeting",
      label: "Meeting",
      icon: <LuFolderClock className="h-5 w-5" />,
    },
  ];

  const isTasksTeamDisabled = currentUser?.role !== "CPC" && !isTeamLead;
  const isBugDisabled = currentUser?.role?.toLowerCase() !== "cpc" && !isTeamLead;
  const isMeetingDisabled = currentUser?.role?.toLowerCase() !== "cpc" && !isTeamLead;

    const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);
  if (status.fetchProject === 'loading' || showLoader) {
    return (
       <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)]"> {/* adjust height if header is fixed */}
        <Spinner />
      </div>
    );
  }
  if (status.fetchProject === "failed") {
    return (
      <div className="w-full h-full ">
        <Card className="border border-red-200 shadow-lg h-[100vh] w-[100vw]">
          <CardContent className="p-6">
            <p className="font-semibold text-lg text-red-700 mb-2">
              Unable to load project
            </p>
            <Button
              onClick={() => dispatch(fetchProjectById(projectId))}
              className=""
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project || !project.data) return null;
const canEditStatus = currentUser?.role?.toLowerCase() === "cpc" || isTeamLead;

  return (
    <div className="min-h-[100vh]">
      <Card className="shadow-xl border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
            
                      <button
  onClick={() => router.back()}
  className="inline-flex cursor-pointer items-center gap-2 bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
  Back
</button>
              <CardTitle className="text-2xl font-bold text-black">
                {project.data.projectName || "Unnamed Project"}
              </CardTitle>
            </div>
            {statusUpdateMessage && (
              <p
                className={`text-sm ${successMessage ? "text-blue-600" : "text-red-600"
                  }`}
              >
                {statusUpdateMessage}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">

            <TabsList className="p-1 bg-gray-100 rounded-full flex flex-wrap justify-center sm:justify-start gap-2">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={
                    (tab.id === "bug" && isBugDisabled)
                    // ((tab.id === "bug" && isBugDisabled) || (tab.id === "meeting" && isMeetingDisabled))
                  }
                  className={`flex cursor-pointer items-center gap-2 rounded-full py-2 px-3 sm:px-4 text-sm font-medium transition-colors
        ${activeTab === tab.id ? "bg-blue text-black" : "text-gray-700 hover:bg-blue-100"}
        ${
                    (tab.id === "bug" && isBugDisabled)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                    }`}
                >
                  {tab.icon && <span className="text-lg">{tab.icon}</span>}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="details" className="min-h-[calc(100vh-200px)]">
              <div className="space-y-6">
                <div className="space-y-4 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-back flex items-center gap-2">
                      <FiInfo className="h-5 w-5 text-blue-600" />
                      Project Details
                    </h3>
                  
                    {(currentUser?.role === "cpc" ) && (
                    // {(currentUser?.role === "cpc" || isTeamLead) && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/project/edit/${projectId}`)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        aria-label="Edit project"
                      >
                        <FiEdit className="h-5 w-5 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pl-7">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Project ID:
                      </span>
                      <span>{project.data.projectId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPaperclip className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Category:
                      </span>
                      <span>{project.data.category || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Client ID:
                      </span>
                      <span>{project.data.clientId || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Status:
                      </span>
                
             <TooltipProvider>
  {canEditStatus ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={() => setIsStatusModalOpen(true)}
          className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md text-sm font-medium ${
            project.data.status === "Completed"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
              : project.data.status === "In Progress"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
              : project.data.status === "Cancelled"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {project.data.status}
          <Pencil className="w-4 h-4 opacity-70" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to update project status</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <div
      className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
        project.data.status === "Completed"
          ? "bg-blue-100 text-blue-800"
          : project.data.status === "In Progress"
          ? "bg-blue-100 text-blue-800"
          : project.data.status === "Cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {project.data.status}
    </div>
  )}
</TooltipProvider>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Team Lead:
                      </span>
                      <span>{project.data.teamLeadName || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiCalendar className="h-4 w-4 text-[#38b000]" />
                      <span className="font-semibold text-gray-900 w-28">
                        Created At:
                      </span>
                      <span>
                        {project.data.createdAt
                          ? new Date(project.data.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {(project.data.startDate ||
                  project.data.endDate ||
                  project.data.attachments?.length > 0) && (
                    <div className="space-y-4 pb-3">
                      <h3 className="text-lg font-bold text-back flex items-center gap-2">
                        <FiCalendar className="h-5 w-5 text-blue-600" />
                        Timeline & Attachments
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pl-7">
                        {project.data.startDate && (
                          <div className="flex items-center gap-3">
                            <FiCalendar className="h-4 w-4 text-[#38b000]" />
                            <span className="font-semibold text-gray-900 w-35">
                              Start Date:
                            </span>
                            <span>
                              {new Date(project.data.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.data.endDate && (
                          <div className="flex items-center gap-3">
                            <FiCalendar className="h-4 w-4 text-[#38b000]" />
                            <span className="font-semibold text-gray-900 w-35">
                              End Date:
                            </span>
                            <span>
                              {new Date(project.data.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pl-7">
                      
                      {project.data.expectedEndDate && (
                        <div className="flex items-center gap-3">
                          <FiCalendar className="h-4 w-4 text-[#38b000]" />
                          <span className="font-semibold text-gray-900 w-35">
                            Expected End Date:
                          </span>
                          <span>
                            
                            {new Date(project.data.expectedEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      </div>
                      
                      {project.data.attachments?.length > 0 && (
                        <div className="flex items-center gap-3 pl-7">
                          <FileStack className="h-4 w-4 text-[#38b000]" />
                          <span className="font-semibold text-gray-900 w-28">
                            Attachments:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {project.data.attachments.map((attachment, index) => (
                              <Button
                                key={index}
                                onClick={() =>
                                  handleDownload(attachment.url, attachment.filename)
                                }
                                disabled={isDownloading}
                                variant="outline"
                                className="flex items-center gap-2 w-full justify-start text-left border-gray-200 hover:bg-blue-50 w-fit"
                                aria-label={`Download ${attachment.filename}`}
                              >
                                <FiDownload className="h-5 w-5 text-blue-600" />
                                <span className="text-gray-700 truncate">
                                  {attachment.filename}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                <div className="space-y-4 pb-3">
                  <h3 className="text-lg font-bold text-back flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-blue-600" />
                    Description
                  </h3>
                  {project.data.description ? (
                    <p className="text-sm text-gray-600 leading-relaxed pl-7">
                      {project.data.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic pl-7">
                      No description available
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="min-h-[calc(100vh-200px)]">
              <div className="space-y-4">
                <AllTaskListByProjectId
                  project={project.data}
                  projectId={project.data.projectId}
                />
              </div>
            </TabsContent>

            <TabsContent value="team" className="min-h-[calc(100vh-200px)]" >
              <div className="space-y-4">
                <div className="flex items-center justify-between relative gap-3">
                 
                  {
                    (currentUser?.role === "cpc" || isTeamLead) && (

                      <Button
                        size="sm"
                        onClick={() => setIsTeamFormOpen(true)}
                        className="bg-blue-600 text-white  hover:bg-blue-700 absolute top-0 right-0"
                        aria-label="Create new team"
                      >
                        <FiPlus className="h-5 w-5 mr-2" />
                        Create Team
                      </Button>
                    )
                  }
                </div>

                {isTeamFormOpen ? (
                  project &&
                  project.data && (
                    <CreateTeamForm
                      projectDetails={{
                        id: project.data.projectId,
                        name: project.data.projectName,
                        teamLead: {
                          id: project.data.teamLeadId,
                          name: project.data.teamLeadName,
                        },
                        teamMembers: [],
                      }}
                      onSuccess={() => setIsTeamFormOpen(false)}
                    />
                  )
                ) : (
                  <ViewTeamByProjectId project={project} projectId={projectId} />
                )}
              </div>
            </TabsContent>
            {/* 
            <TabsContent value="meeting">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                    Meeting
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setIsMeetingModalOpen(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    aria-label="Create new meeting"
                  >
                    <FiPlus className="h-5 w-5 mr-2" />
                    Create Meeting
                  </Button>
                </div>

                <ProjectWiseTeamMeet project={project.data}  projectId={projectId} teamLeadId={project?.data?.teamLeadId} />
              </div>
            </TabsContent> */}


            <TabsContent value="bug" className="min-h-[calc(100vh-200px)]">
              <div className="space-y-4">


                <ProjectWisebugList project={project.data} projectId={projectId} teamLeadId={project?.data?.teamLeadId} />
              </div>
            </TabsContent>


            <TabsContent value="meeting" className="min-h-[calc(100vh-200px)]">
              <div className="space-y-4">


                <ProjectwiseAllMeetingAndMom project={project.data} projectId={projectId} teamLeadId={project?.data?.teamLeadId} />
              </div>
            </TabsContent>



          </Tabs>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="bg-white rounded-lg shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-blue-900">
              Update Project Status
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Status
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions
                  .filter((status) => status !== project.data.status)
                  .map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
              aria-label="Cancel status update"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              disabled={!newStatus}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Status Change */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="bg-white rounded-lg shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Confirm Status Change
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to change the project status to{" "}
            <span className="font-semibold text-blue-600">{newStatus}</span>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
              aria-label="Cancel status change confirmation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Creation Modal */}
      {/* <Dialog open={isMeetingModalOpen} onOpenChange={setIsMeetingModalOpen}>
        <DialogContent className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Create New Meeting
            </DialogTitle>
          </DialogHeader>
          <TeamMeetingCreateForm
            projectId={projectId} teamLeadId={project.data.teamLeadId}
            onSubmit={() => setIsMeetingModalOpen(false)}
          />
        </DialogContent>
      </Dialog> */}
    </div>
  );
}