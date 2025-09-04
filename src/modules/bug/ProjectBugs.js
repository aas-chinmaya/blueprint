"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBugByProjectId,
  resolveBug,
  clearErrors,
} from "@/features/bugSlice";
import {
  Bug as BugIcon,
  Loader2,
  Filter,
  ChevronDown,
  Eye,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { fetchProjectById } from "@/features/projectSlice";
export default function ProjectBugs({ projectId }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 10
  );
  const [selectedBug, setSelectedBug] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { bugsByProjectId, loading, error } = useSelector((state) => ({
    bugsByProjectId: state.bugs.bugsByProjectId || [],
    loading: state.bugs.loading,
    error: state.bugs.error,
  }));
 const { project } = useSelector(
    (state) => state.project
  );
    useEffect(() => {
      if (projectId) {
        dispatch(fetchProjectById(projectId));
      }
    }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchBugByProjectId(projectId)).then((result) => {
        if (result.error) {
          toast.error(`Failed to fetch bugs: ${result.error.message}`);
        }
      });
    }
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch, projectId]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  // Calculate bug statistics
  const bugStats = {
    total: bugsByProjectId?.length || 0,
    open:
      bugsByProjectId?.filter((bug) => bug.status.toLowerCase() === "open")
        .length || 0,
    resolved:
      bugsByProjectId?.filter((bug) => bug.status.toLowerCase() === "resolved")
        .length || 0,
  };
  // Filter bugs by status
  const filteredBugs = () => {
    let filtered = bugsByProjectId || [];
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (bug) => bug.status.toLowerCase() === selectedStatus
      );
    }
    return filtered;
  };

  // Pagination logic
  const sortedBugs = filteredBugs();
  const totalItems = sortedBugs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastBug = page * itemsPerPage;
  const indexOfFirstBug = indexOfLastBug - itemsPerPage;
  const paginatedBugs = sortedBugs.slice(indexOfFirstBug, indexOfLastBug);

  const handleViewClick = (bug) => {
    setSelectedBug(bug);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBug(null);
  };

  const handleResolveBug = (bugId) => {
    dispatch(resolveBug(bugId)).then((result) => {
      if (result.error) {
        toast.error(`Failed to resolve bug: ${result.error.message}`);
      } else {
        toast.success("Bug resolved successfully!");
        handleModalClose();
      }
    });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedStatus("all");
    setPage(1);
  };

  const priorityStyles = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    High: "bg-red-100 text-red-800 border-red-200",
    Critical: "bg-red-200 text-red-900 border-red-300",
  };

  const statusStyles = {
    Open: "bg-red-100 text-red-800 border-red-200",
    "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Resolved: "bg-green-100 text-green-800 border-green-200",
    Closed: "bg-gray-100 text-gray-800 border-gray-200",
  };

  // Loading state
  if (loading.bugsByProjectId) {
    return (
      <div className="p-6 space-y-4 bg-card rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error.bugsByProjectId) {
    return (
      <div className="mt-8 text-center bg-card p-6 rounded-lg border h-[80vh]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-danger mb-2">
          Error loading bugs
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {error.bugsByProjectId}
        </p>
      </div>
    );
  }

  // Empty state
  if (!bugsByProjectId || bugsByProjectId.length === 0) {
    return (
      <>
        {/* Header */}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
  <span className="flex items-center gap-2">

    Reported Issues : 
  </span>
  <span className="text-bold font-medium text-blue-700 ">
    {project?.data?.projectName}
  </span>
</h1>
        
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                  <div className="flex justify-between w-full">
                    <span>All Statuses</span>
                    <Badge variant="secondary">{bugStats.total}</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter("open")}>
                  <div className="flex justify-between w-full">
                    <div className="flex items-center">
                      <span className="mr-1.5 text-red-500">●</span>
                      Open
                    </div>
                    <Badge variant="secondary">{bugStats.open}</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusFilter("resolved")}
                >
                  <div className="flex justify-between w-full">
                    <div className="flex items-center">
                      <span className="mr-1.5 text-green-500">●</span>
                      Resolved
                    </div>
                    <Badge variant="secondary">{bugStats.resolved}</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={clearFilters}
                  className="justify-center"
                >
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-8 text-center bg-card p-6 rounded-lg border h-[80vh]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No bugs found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No bugs are available for this project.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
  <span className="flex items-center gap-2">

    Reported Issues : 
  </span>
  <span className="text-bold font-medium text-blue-700 ">
    {project?.data?.projectName}
  </span>
</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-blue-700 font-bold hover:text-blue-700">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                <div className="flex justify-between w-full">
                  <span>All Statuses</span>
                  <Badge variant="secondary">{bugStats.total}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("open")}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-red-500">●</span>
                    Open
                  </div>
                  <Badge variant="secondary">{bugStats.open}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("resolved")}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-green-500">●</span>
                    Resolved
                  </div>
                  <Badge variant="secondary">{bugStats.resolved}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={clearFilters}
                className="justify-center"
              >
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bugs Table */}
      {paginatedBugs.length === 0 ? (
        <div className="bg-card rounded-lg border text-center p-6 h-[80vh]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No bugs found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {selectedStatus === "all"
              ? "No bugs are available for this project."
              : "No bugs match your current filter. Try adjusting your filter criteria."}
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 mx-auto"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <TableRow>
                  <TableHead className="text-center text-white">
                    S.No.
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Bug Id
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Task Id
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Priority
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Status
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Created At
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBugs.map((bug, index) => (
                  <TableRow key={bug._id}>
                    <TableCell className="text-center">
                      {indexOfFirstBug + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {bug.bug_id || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      {bug.taskRef || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`${
                          priorityStyles[bug.priority] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                        } border`}
                      >
                        {bug.priority || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`${
                          statusStyles[bug.status] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                        } border capitalize`}
                      >
                        {bug.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {bug.createdAt
                        ? new Date(bug.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleViewClick(bug)}
                              aria-label={`View bug ${bug.bug_id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span>View Bug Details</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedBugs.length} of {totalItems} bugs
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Rows:</label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-2 text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bug Details Dialog */}

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Bug Details
            </DialogTitle>
          </DialogHeader>

          {selectedBug && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Bug ID
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.bug_id || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.description || "N/A"}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Title
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.title || "No description provided"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Task Ref
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.taskRef || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Assigned To
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.assignedToDetails?.memberName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Priority
                </label>
                <p>
                  <Badge
                    className={`${
                      priorityStyles[selectedBug.priority] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    } border`}
                  >
                    {selectedBug.priority || "N/A"}
                  </Badge>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <p>
                  <Badge
                    className={`${
                      statusStyles[selectedBug.status] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    } border capitalize`}
                  >
                    {selectedBug.status || "N/A"}
                  </Badge>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Deadline
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.deadline
                    ? new Date(selectedBug.deadline).toLocaleDateString("en-IN")
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Created At
                </label>
                <p className="text-muted-foreground">
                  {selectedBug.createdAt
                    ? new Date(selectedBug.createdAt).toLocaleDateString(
                        "en-IN"
                      )
                    : "N/A"}
                </p>
              </div>

              {selectedBug.resolvedAt && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Resolved At
                  </label>
                  <p className="text-muted-foreground">
                    {new Date(selectedBug.resolvedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}

              {error.bugResolve && (
                <div className="md:col-span-2">
                  <p className="text-sm text-danger mt-1 bg-red-50 p-2 rounded-md">
                    {error.bugResolve}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* <div className="flex justify-end gap-2">
            {selectedBug?.status.toLowerCase() !== "resolved" && (
              <Button
                onClick={() => handleResolveBug(selectedBug.bug_id)}
                className="bg-blue-700 hover:bg-blue-700 text-white "
                disabled={loading.bugResolve}
              >
                {loading.bugResolve ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Resolve Bug"
                )}
              </Button>
            )}
          </div> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
