





"use client";
import { format, parseISO } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchTasksByProjectId,
  deleteTask,
  downloadTasksReport,
  selectTasksByProjectId,
  selectTaskStatus,
  selectTaskError,
} from "@/features/taskSlice";
import { Eye, Edit, Trash2, X, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useLoggedinUser } from "@/hooks/useLoggedinUser";
import Spinner from "@/components/loader/Spinner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";


const AllTaskListByProjectId = ({ projectId, project }) => {
  const { currentUser, isTeamLead } = useLoggedinUser(project?.teamLeadId);
// console.log("is team lead in all task list by project id",currentUser, isTeamLead)
  const dispatch = useDispatch();
  const router = useRouter();

  // Local UI states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Fetch tasks
  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasksByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  // Loader timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const tasks = useSelector((state) => selectTasksByProjectId(state, projectId));
  const status = useSelector(selectTaskStatus);
  const error = useSelector(selectTaskError);

  const handleViewTask = (task_id) => router.push(`/task/${task_id}`);
  const handleEditTask = (task_id) => router.push(`/task/edit/${task_id}`);

  const handleDeleteTask = async () => {
    try {
      await dispatch(deleteTask(taskIdToDelete)).unwrap();
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error(err || "Failed to delete task. Please try again.");
    }
    setShowDeleteModal(false);
    setTaskIdToDelete(null);
  };

  const openDeleteModal = (task_id) => {
    setTaskIdToDelete(task_id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskIdToDelete(null);
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Unique assigned members for dropdown and map for IDs
  const assignedMembers = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    const unique = new Set(
      tasks.map((t) => t?.assignedToDetails?.memberName).filter(Boolean)
    );
    return Array.from(unique);
  }, [tasks]);

  const assignedMembersMap = useMemo(() => {
    if (!Array.isArray(tasks)) return {};
    const map = {};
    tasks.forEach((task) => {
      if (task.assignedToDetails?.memberName && task.assignedTo) {
        map[task.assignedToDetails.memberName] = task.assignedTo;
      }
    });
    return map;
  }, [tasks]);

  // Filter + search + sort logic
  const filteredTasks = useMemo(() => {
    let filtered = Array.isArray(tasks) ? [...tasks] : [];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.task_id?.toLowerCase().includes(query) ||
          task?.assignedToDetails?.memberName?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // AssignedTo filter
    if (assignedToFilter && assignedToFilter !== "all") {
      filtered = filtered.filter(
        (task) => task?.assignedToDetails?.memberName === assignedToFilter
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((task) => {
        if (!task.deadline) return false;
        const taskDate = new Date(task.deadline);
        if (dateFrom && taskDate < dateFrom) return false;
        if (dateTo && taskDate > dateTo) return false;
        return true;
      });
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key.includes(".")) {
          const keys = sortConfig.key.split(".");
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    tasks,
    searchQuery,
    priorityFilter,
    statusFilter,
    assignedToFilter,
    dateFrom,
    dateTo,
    sortConfig,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setAssignedToFilter("all");
    setDateFrom(null);
    setDateTo(null);
    setSortConfig({ key: "", direction: "asc" });
  };

  const handleDownloadReport = async () => {
    const filterObj = {
      search: searchQuery || undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      assignedTo: assignedToFilter !== "all" ? assignedMembersMap[assignedToFilter] : undefined,
      // assignedTo: assignedToFilter !== "all" ? assignedToFilter : undefined,
      dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
      dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    };

    const sortKey = sortConfig.key
      ? `${sortConfig.key}_${sortConfig.direction}`
      : undefined;

    const assignedTo = assignedToFilter !== "all" ? assignedMembersMap[assignedToFilter] : undefined;
    // const employeeId = assignedToFilter !== "all" ? assignedMembersMap[assignedToFilter] : undefined;

    const payload = {
      projectId,
      assignedTo,
      filterObj,
      sortKey,
    };

    try {
      await dispatch(downloadTasksReport(payload)).unwrap();
      toast.success("Report downloaded successfully!");
    } catch (err) {
      toast.error(err || "Failed to download report. Please try again.");
    }
  };

  if (status === "loading" || showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Filters */}
 
        <div className=" mb-2 flex flex-col sm:flex-row flex-wrap items-center gap-3   ">
          {/* Search */}
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 lg:w-64 bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300 rounded-lg"
          />

          {/* Priority */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36 lg:w-44 bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300 rounded-lg">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-gray-200 rounded-lg">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 lg:w-44 bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-gray-200 rounded-lg">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Assigned To */}
          <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
            <SelectTrigger className="w-full sm:w-36 lg:w-44 bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-300 rounded-lg">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-gray-200 rounded-lg">
              <SelectItem value="all">All Assigned</SelectItem>
              {assignedMembers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* From Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-36 lg:w-44 justify-between bg-gray-50 border-gray-300 hover:bg-gray-100 transition-all duration-300 rounded-lg",
                  !dateFrom && "text-gray-500"
                )}
              >
                {dateFrom ? format(dateFrom, "PPP") : <span>From Date</span>}
                <CalendarIcon className="ml-2 h-4 w-4 text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white shadow-xl border-gray-200 rounded-lg">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>

          {/* To Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-36 lg:w-44 justify-between bg-gray-50 border-gray-300 hover:bg-gray-100 transition-all duration-300 rounded-lg",
                  !dateTo && "text-gray-500"
                )}
              >
                {dateTo ? format(dateTo, "PPP") : <span>To Date</span>}
                <CalendarIcon className="ml-2 h-4 w-4 text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white shadow-xl border-gray-200 rounded-lg">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>

          {/* Buttons */}
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full sm:w-auto bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-200 transition-all duration-300 rounded-lg"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleDownloadReport}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 rounded-lg"
            >
              Download Report
            </Button>
       
        </div>
   

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xl bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300">
              {[
                { label: "SL. No", key: "" },
                { label: "Task ID", key: "task_id" },
                { label: "Title", key: "title" },
                { label: "Assigned To", key: "assignedToDetails.memberName" },
                { label: "Priority", key: "priority" },
                { label: "Deadline", key: "deadline" },
                { label: "Status", key: "status" },
                { label: "Actions", key: "" },
              ].map((col, i) => (
                <TableHead
                  key={i}
                  className="text-white font-semibold uppercase tracking-wider cursor-pointer px-4 py-3 text-xs sm:text-sm"
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.label}
                  {sortConfig.key === col.key &&
                    (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-6 text-sm sm:text-base">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task, index) => (
                <TableRow key={task._id} className="hover:bg-gray-50 transition-all duration-200">
                  <TableCell className="px-4 py-3 text-sm sm:text-base">{index + 1}</TableCell>
                  <TableCell className="px-4 py-3 text-sm sm:text-base">{task.task_id}</TableCell>
                  <TableCell className="px-4 py-3 text-sm sm:text-base">{task.title}</TableCell>
                  <TableCell className="px-4 py-3 text-sm sm:text-base">
                    {task?.assignedToDetails?.memberName || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full",
                        task.priority === "Low"
                          ? "bg-green-100 text-green-800"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : task.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {task.priority || "N/A"}
                    </span>
                  </TableCell>
                
                <TableCell className="px-4 py-3 text-sm sm:text-base">
  {task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "N/A"}
</TableCell>

                  <TableCell className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full",
                        task.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {task.status || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewTask(task.task_id)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-all duration-200"
                        title="View Task"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      {(currentUser?.isCpc === "cpc" || currentUser?.isTeamLead
 ) && (
                      // {(currentUser?.role === "cpc" || isTeamLead) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTask(task.task_id)}
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-full transition-all duration-200"
                            title="Edit Task"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(task.task_id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all duration-200"
                            title="Delete Task"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={closeDeleteModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Confirm Deletion
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeDeleteModal}
                  className="text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-200 transition-all duration-300 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTask}
                  className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300 rounded-lg"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllTaskListByProjectId;