"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LucideCalendar,
  LucideUsers,
  LucideFolder,
  LucideLoader2,
  LucideChevronLeft,
  LucideChevronRight,
  NotebookPen,
  Tag,
  UserRound,
  CalendarDays,
  ChartLine,
  ClipboardPenLine,
  TriangleAlert,
} from "lucide-react";

// Redux actions
import { fetchTasksByDeadline } from "@/features/dashboard/dashboardSlice";
import { fetchAllProjects } from "@/features/projectSlice";
import { fetchAllTeams } from "@/features/teamSlice";
import { useRouter } from "next/navigation";

// Skeleton Components
const TaskSkeleton = () => (
  <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div>
        <div className="h-4 w-32 bg-muted rounded mb-1"></div>
        <div className="h-3 w-16 bg-muted rounded"></div>
      </div>
    </div>
    <div className="h-6 w-20 bg-muted rounded-full"></div>
  </div>
);

const ProjectSkeleton = () => (
  <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div>
        <div className="h-4 w-36 bg-muted rounded mb-1"></div>
        <div className="h-3 w-24 bg-muted rounded"></div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 bg-muted rounded-full"></div>
      <div className="h-3 w-8 bg-muted rounded"></div>
    </div>
  </div>
);

const TeamSkeleton = () => (
  <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 bg-muted rounded"></div>
      <div>
        <div className="h-4 w-40 bg-muted rounded mb-1"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    </div>
    <div className="h-6 w-24 bg-muted rounded-full"></div>
  </div>
);

const TabHeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex w-full sm:w-auto bg-transparent border border-border rounded-lg p-1">
      <div className="flex-1 h-10 bg-muted rounded-md mx-1 animate-pulse"></div>
      <div className="flex-1 h-10 bg-muted rounded-md mx-1 animate-pulse"></div>
      <div className="flex-1 h-10 bg-muted rounded-md mx-1 animate-pulse"></div>
    </div>
  </div>
);

export function DataTable() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("task");
  const [page, setPage] = useState({ task: 1, projects: 1, team: 1 });
  const [openModal, setOpenModal] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;

  // Selectors
  const { data, error, status } = useSelector(
    (state) => state.dashboard.deadlineTasks
  );
  const { projects = [], status: projectStatus } = useSelector(
    (state) => state.project
  );
  const { allTeams, status: teamStatus } = useSelector((state) => state.team);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchTasksByDeadline());
    dispatch(fetchAllProjects());
    dispatch(fetchAllTeams());
  }, [dispatch]);

  // Pagination logic
  const paginate = (items, page) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const renderPagination = (totalItems, tab) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return (
      <div className="flex items-center justify-end gap-4 mt-4 px-4 lg:px-6">
        <span className="text-sm font-medium text-muted-foreground">
          Page {page[tab]} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1447e6] text-white border-green-700 hover:bg-green-700 hover:text-white transition-all duration-200"
            onClick={() =>
              setPage((prev) => ({ ...prev, [tab]: prev[tab] - 1 }))
            }
            disabled={page[tab] === 1}
          >
            <LucideChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1447e6] text-white border-green-700 hover:bg-green-700 hover:text-white transition-all duration-200"
            onClick={() =>
              setPage((prev) => ({ ...prev, [tab]: prev[tab] + 1 }))
            }
            disabled={page[tab] === totalPages}
          >
            <LucideChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    );
  };

  // Function to get progress percentage based on status
  const getProgressValue = (status) => {
    switch (status) {
      case "Planned":
        return 0;
      case "In Progress":
        return 50;
      case "Completed":
        return 100;
      default:
        return 0;
    }
  };

  // Render modal content based on tab and item
  const renderModalContent = (item, type) => {
    if (type === "task") {
      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Tag />
            Task ID: {item.task_id}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ClipboardPenLine />
            Project: {item.projectName}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <UserRound />
            Assigned To: {item.assignedTo}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TriangleAlert />
            Priority: {item.priority}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ChartLine />
            Status: {item.status}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarDays />
            Deadline: {new Date(item.deadline).toLocaleDateString()}
          </p>
        </div>
      );
    } else if (type === "project") {
      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold text-foreground">
            {item.projectName}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <Tag />
            Project ID: {item.projectId}
          </p>

          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <UserRound />
            Team Lead: {item.teamLeadName}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <CalendarDays />
            Start Date: {item.startDate}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <CalendarDays />
            End Date: {item.endDate}
          </p>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Progress
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={getProgressValue(item.status)} // Replace with actual progress data
                className="h-2 bg-muted"
                indicatorClassName="bg-[#1447e6]"
              />
              <span className="text-xs text-gray-600 font-medium">
                {getProgressValue(item.status)}%
              </span>
            </div>
          </div>
          <Button
            className="w-1/4 ml-80 bg-[#1447e6]"
            onClick={() => router.push(`/project/${item.projectId}`)}
          >
            View More
          </Button>
        </div>
      );
    } else if (type === "team") {
      const visibleMembers = showAll
        ? item.teamMembers
        : item.teamMembers.slice(0, 4);

      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold text-foreground">
            {item.projectName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Project ID: {item.projectId}
          </p>
          <p className="text-sm text-muted-foreground">
            Team ID: {item.teamId}
          </p>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Team Lead
            </h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">{item.teamLeadName}</span> (
              {item.teamLeadId})
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleMembers.map((member) => (
              <div
                key={member._id}
                className="border border-border rounded-lg p-3 bg-muted/20 hover:bg-muted/50 transition-all duration-200"
              >
                <p className="font-semibold text-foreground">
                  {member.memberName}
                </p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {member.memberId}
                </p>
              </div>
            ))}
          </div>
          {item.teamMembers.length > 4 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-2 text-sm text-primary hover:underline self-start"
            >
              {showAll ? "View Less" : "View More"}
            </button>
          )}
        </div>
      );
    }
  };

  // Check if all data is still loading for initial render
  const allDataLoading =
    status === "loading" &&
    projectStatus === "loading" &&
    teamStatus === "loading";

  return (
    <div className="p-4 lg:p-6">
      <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
        {allDataLoading ? (
          // Show skeleton for entire component on initial load
          <>
            <TabHeaderSkeleton />
            <div className="p-4 lg:p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <TaskSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <Tabs
            defaultValue="task"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border ">
              <TabsList className="flex w-full sm:w-auto bg-transparent border border-border rounded-lg p-1">
                <TabsTrigger
                  value="task"
                  className="flex-1 cursor-pointer text-sm font-medium text-foreground data-[state=active]:bg-[#1447e6] data-[state=active]:text-white rounded-md py-2 px-3 transition-all duration-200 hover:bg-muted"
                >
                  <LucideCalendar className="h-4 w-4 mr-2" /> Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex-1 text-sm cursor-pointer font-medium text-foreground data-[state=active]:bg-[#1447e6] data-[state=active]:text-white rounded-md py-2 px-3 transition-all duration-200 hover:bg-muted"
                >
                  <LucideFolder className="h-4 w-4 mr-2" /> Projects
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-muted text-muted-foreground font-medium text-xs"
                  >
                    {projects.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="flex-1 cursor-pointer text-sm font-medium text-foreground data-[state=active]:bg-[#1447e6] data-[state=active]:text-white rounded-md py-2 px-3 transition-all duration-200 hover:bg-muted"
                >
                  <LucideUsers className="h-4 w-4 mr-2" /> Teams
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-muted text-muted-foreground font-medium text-xs"
                  >
                    {allTeams?.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <Select defaultValue="task" onValueChange={setActiveTab}>
                <SelectTrigger className="w-32 sm:hidden" size="sm">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="team">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6">
              {/* Tasks Tab */}
              <TabsContent value="task" className="mt-0">
                {status === "loading" && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TaskSkeleton key={index} />
                    ))}
                  </div>
                )}
                {status === "failed" && (
                  <div className="text-center text-sm  min-h-[50vh] flex justify-center items-center">
                    No tasks available
                  </div>
                )}
                {status === "succeeded" && data?.data?.length > 0 ? (
                  <>
                    {paginate(data.data, page.task).map((task) => (
                      <Dialog
                        key={task._id}
                        open={openModal === task._id}
                        onOpenChange={(open) =>
                          setOpenModal(open ? task._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center gap-4">
                              <LucideCalendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {task.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                 Task ID: {task.task_id}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                task.status === "Completed"
                                  ? "bg-[#1447e6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border rounded-lg max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-center gap-3 text-[22px] text-bold sm:text-left bg-blue-100 text-blue-800 p-4 rounded-2xl ">
                              Task Details
                            </DialogTitle>
                          </DialogHeader>
                          {renderModalContent(task, "task")}
                        </DialogContent>
                      </Dialog>
                    ))}
                    {renderPagination(data.data.length, "task")}
                  </>
                ) : (
                  status === "succeeded" && (
                    <div className="text-center text-sm text-muted-foreground min-h-[50vh] flex justify-center items-center">
                      No tasks available
                    </div>
                  )
                )}
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="mt-0">
                {projectStatus === "loading" && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <ProjectSkeleton key={index} />
                    ))}
                  </div>
                )}
                {projects.length > 0 ? (
                  <>
                    {paginate(projects, page.projects).map((project) => (
                      <Dialog
                        key={project.projectId}
                        open={openModal === project.projectId}
                        onOpenChange={(open) =>
                          setOpenModal(open ? project.projectId : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center gap-4">
                              <LucideFolder className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {project.projectName}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Project ID: {project.projectId}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Progress
                                value={getProgressValue(project.status)} // Replace with actual progress data
                                className="h-2 w-24 bg-muted"
                                indicatorClassName="bg-[#1447e6]"
                              />
                              <span className="text-xs text-gray-600 font-medium">
                                {getProgressValue(project.status)}%
                              </span>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border rounded-lg max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-center gap-3 text-[22px] text-bold sm:text-left  p-4 rounded-2xl bg-blue-100 text-blue-800">
                              {" "}
                              <NotebookPen />
                              Project Details
                            </DialogTitle>
                          </DialogHeader>
                          {renderModalContent(project, "project")}
                        </DialogContent>
                      </Dialog>
                    ))}
                    {renderPagination(projects.length, "projects")}
                  </>
                ) : (
                  projectStatus === "succeeded" && (
                    <div className="text-center text-sm text-muted-foreground min-h-[50vh] flex justify-center items-center">
                      No projects found
                    </div>
                  )
                )}
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="mt-0">
                {teamStatus === "loading" && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TeamSkeleton key={index} />
                    ))}
                  </div>
                )}
                {teamStatus === "succeeded" && allTeams?.length > 0 ? (
                  <>
                    {paginate(allTeams, page.team).map((team) => (
                      <Dialog
                        key={team._id}
                        open={openModal === team._id}
                        onOpenChange={(open) =>
                          setOpenModal(open ? team._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between p-4 mb-3 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center gap-4">
                              <LucideUsers className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {team.projectName}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Team ID: {team.teamId}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-muted text-muted-foreground">
                              Members: {team.teamMembers.length}
                            </Badge>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border rounded-lg max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">
                              Team Details
                            </DialogTitle>
                          </DialogHeader>
                          {renderModalContent(team, "team")}
                        </DialogContent>
                      </Dialog>
                    ))}
                    {renderPagination(allTeams.length, "team")}
                  </>
                ) : (
                  teamStatus === "succeeded" && (
                    <div className="text-center text-sm text-muted-foreground min-h-[50vh] flex justify-center items-center">
                      No team members found
                    </div>
                  )
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}
