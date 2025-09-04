

"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LucideFolder,
  LucideUsers,
  LucideChevronLeft,
  LucideChevronRight,
  ClipboardPenLine,
  Tag,
  UserRound,
  TriangleAlert,
  ChartLine,
  CalendarDays,
  NotebookPen,
} from "lucide-react";

import { getAllTaskByEmployeeId } from "@/features/taskSlice";
import { fetchProjectsByEmployeeId } from "@/features/projectSlice";
import { fetchTeamsByEmployeeId } from "@/features/teamSlice";

export function DataTableEmployee({ employeeId }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("task");
  const [page, setPage] = useState({ task: 1, projects: 1, team: 1 });
  const [openModal, setOpenModal] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = 5;

  const { employeeTasks = [], isLoading: taskLoading } = useSelector(
    (state) => state.task
  );
  const { employeeProjects = [], status: projectStatus } = useSelector(
    (state) => state.project
  );
  const { teamsByEmployee = [], status: teamStatus } = useSelector(
    (state) => state.team
  );

  useEffect(() => {
    if (employeeId) {
      dispatch(getAllTaskByEmployeeId(employeeId));
      dispatch(fetchProjectsByEmployeeId(employeeId));
      dispatch(fetchTeamsByEmployeeId(employeeId));
    }
  }, [dispatch, employeeId]);

  const paginate = (items, pageNum) => {
    const start = (pageNum - 1) * itemsPerPage;
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
            className="h-8 w-8 p-0 bg-[#1447e6] text-white border-green-700 hover:bg-green-700"
            onClick={() =>
              setPage((prev) => ({ ...prev, [tab]: prev[tab] - 1 }))
            }
            disabled={page[tab] === 1}
          >
            <LucideChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1447e6] text-white border-green-700 hover:bg-green-700"
            onClick={() =>
              setPage((prev) => ({ ...prev, [tab]: prev[tab] + 1 }))
            }
            disabled={page[tab] === totalPages}
          >
            <LucideChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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
  const renderModalContent = (item, type) => {
    if (type === "task") {
      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <Tag /> Task ID: {item.task_id}
          </p>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <ClipboardPenLine /> Project: {item.projectName}
          </p>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <UserRound /> Assigned To: {item.assignedTo}
          </p>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <TriangleAlert /> Priority: {item.priority}
          </p>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <ChartLine /> Status: {item.status}
          </p>
          <p className="flex items-center text-sm text-muted-foreground gap-2">
            <CalendarDays /> Deadline:{" "}
            {new Date(item.deadline).toLocaleDateString()}
          </p>
        </div>
      );
    }

    if (type === "project") {
      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold">{item.projectName}</h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag /> Project ID: {item.projectId}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound /> Team Lead: {item.teamLeadName}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-3">
              <CalendarDays />
              Start Date: {item.startDate}
            </p>
            <CalendarDays />
            End Date: {item.endDate}
          </p>
          <div>
            <p className="text-sm font-medium mb-1 text-muted-foreground">
              Progress
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={getProgressValue(item.status)}
                className="h-2 bg-muted"
                indicatorClassName="bg-[#1447e6]"
              />
              <span className="text-xs text-muted-foreground">
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
    }

    if (type === "team") {
      const visibleMembers = showAll
        ? item.teamMembers
        : item.teamMembers.slice(0, 4);
      return (
        <div className="grid gap-4 p-4">
          <h3 className="text-lg font-semibold">{item.projectName}</h3>
          <p className="text-sm text-muted-foreground">
            Team ID: {item.teamId}
          </p>
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h4 className="text-sm font-medium mb-2">Team Lead</h4>
            <p className="text-sm">
              <span className="font-semibold">{item.teamLeadName}</span> (
              {item.teamLeadId})
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleMembers.map((member) => (
              <div
                key={member._id}
                className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/40"
              >
                <p className="font-semibold">{member.memberName}</p>
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
              className="mt-2 text-sm text-primary hover:underline"
            >
              {showAll ? "View Less" : "View More"}
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Header Tabs */}
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList className="flex w-full sm:w-auto bg-transparent border rounded-lg p-1">
              <TabsTrigger
                value="task"
                className="flex-1 text-sm font-medium cursor-pointer data-[state=active]:bg-[#1447e6] data-[state=active]:text-white py-2 px-3 rounded-md"
              >
                <LucideCalendar className="h-4 w-4 mr-2" /> Tasks
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="flex-1 text-sm font-medium cursor-pointer data-[state=active]:bg-[#1447e6] data-[state=active]:text-white py-2 px-3 rounded-md"
              >
                <LucideFolder className="h-4 w-4 mr-2" /> Projects
                <Badge className="ml-2 bg-muted text-muted-foreground">
                  {employeeProjects.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="flex-1 text-sm cursor-pointer font-medium data-[state=active]:bg-[#1447e6] data-[state=active]:text-white py-2 px-3 rounded-md"
              >
                <LucideUsers className="h-4 w-4 mr-2" /> Teams
                <Badge className="ml-2 bg-muted text-muted-foreground">
                  {teamsByEmployee.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tasks */}
             <div className="p-4 lg:p-6">

          <TabsContent value="task">
            {paginate(employeeTasks, page.task).map((task) => (
              <Dialog
                key={task._id}
                open={openModal === task._id}
                onOpenChange={(open) => setOpenModal(open ? task._id : null)}
              >
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 mb-3 border rounded-lg hover:bg-muted/40 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <LucideCalendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-semibold">{task.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          ID: {task.task_id}
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
                <DialogContent className="bg-background rounded-lg max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-3 text-lg font-bold bg-blue-100  p-4 rounded-2xl text-blue-800">
                      Task Details
                    </DialogTitle>
                  </DialogHeader>
                  {renderModalContent(task, "task")}
                </DialogContent>
              </Dialog>
            ))}
            {renderPagination(employeeTasks.length, "task")}
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            {paginate(employeeProjects, page.projects).map((project) => (
              <Dialog
                key={project.projectId}
                open={openModal === project.projectId}
                onOpenChange={(open) =>
                  setOpenModal(open ? project.projectId : null)
                }
              >
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 mb-3 border rounded-lg hover:bg-muted/40 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <LucideFolder className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-semibold">
                          {project.projectName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Project ID: {project.projectId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={getProgressValue(project.status)}
                        className="h-2 w-24 bg-muted"
                        indicatorClassName="bg-[#1447e6]"
                      />
                      <span className="text-xs text-muted-foreground">
                        {getProgressValue(project.status)}%
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-background rounded-lg max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-3 text-lg font-bold bg-blue-100 p-4 rounded-2xl text-blue-800">
                      <NotebookPen /> Project Details
                    </DialogTitle>
                  </DialogHeader>
                  {renderModalContent(project, "project")}
                </DialogContent>
              </Dialog>
            ))}
            {renderPagination(employeeProjects.length, "projects")}
          </TabsContent>

          {/* Teams */}
          <TabsContent value="team">
            {paginate(teamsByEmployee, page.team).map((team) => (
              <Dialog
                key={team._id}
                open={openModal === team._id}
                onOpenChange={(open) => setOpenModal(open ? team._id : null)}
              >
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 mb-3 border rounded-lg hover:bg-muted/40 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <LucideUsers className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-semibold">
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
                <DialogContent className="bg-background rounded-lg max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg text-blue-800 font-semibold">
                      Team Details
                    </DialogTitle>
                  </DialogHeader>
                  {renderModalContent(team, "team")}
                </DialogContent>
              </Dialog>
            ))}
            {renderPagination(teamsByEmployee.length, "team")}
          </TabsContent>
             </div>
        </Tabs>
      </div>
    </div>
  );
}
