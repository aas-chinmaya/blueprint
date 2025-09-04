
'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBugByEmployeeId,
  resolveBug,
  clearErrors,
} from "@/features/bugSlice";
import {
  Bug as BugIcon,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Status and priority styling (black and white)
const statusColors = {
  open: "bg-red-100 text-red-800 border-red-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
};

const priorityColors = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-green-100 text-green-800 border-green-200",
};

const reviewStatusColors = {
  NA: "bg-gray-100 text-gray-800 border-gray-300",
  INREVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  BUGREPORTED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
};

// Separate selectors for each state property
const selectBugsByEmployeeId = (state) => state.bugs.bugsByEmployeeId;
const selectLoading = (state) => state.bugs.loading;
const selectError = (state) => state.bugs.error;

export default function AllBugByEmployeeId() {
  const { currentUser } = useCurrentUser();
  const employeeId = currentUser?.id;
  const dispatch = useDispatch();
  const bugsByEmployeeId = useSelector(selectBugsByEmployeeId);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortField, setSortField] = useState(null); // No default sorting
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [goToPage, setGoToPage] = useState("");
  const [selectedBug, setSelectedBug] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState("");

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchBugByEmployeeId(employeeId)).then((result) => {
        // if (result.error) {
        //   toast.error(`Failed to fetch bugs: ${result.error.message}`);
        // }
      });
    }
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch, employeeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, itemsPerPage]);

  // Calculate bug statistics
  const bugStats = {
    total: bugsByEmployeeId?.length || 0,
    open:
      bugsByEmployeeId?.filter((bug) => bug.status.toLowerCase() === "open")
        .length || 0,
    resolved:
      bugsByEmployeeId?.filter((bug) => bug.status.toLowerCase() === "resolved")
        .length || 0,
    highPriority:
      bugsByEmployeeId?.filter((bug) => bug.priority === "High").length || 0,
    mediumPriority:
      bugsByEmployeeId?.filter((bug) => bug.priority === "Medium").length || 0,
    lowPriority:
      bugsByEmployeeId?.filter((bug) => bug.priority === "Low").length || 0,
  };

  // Filter and sort bugs
  const filteredAndSortedBugs = () => {
    let filtered = bugsByEmployeeId || [];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (bug) => bug.status.toLowerCase() === selectedStatus
      );
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter((bug) => bug.priority === selectedPriority);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bug) =>
          bug.bug_id?.toLowerCase().includes(term) ||
          bug.title?.toLowerCase().includes(term) ||
          bug.description?.toLowerCase().includes(term) ||
          bug.taskRef?.toLowerCase().includes(term)
      );
    }

    // Only sort if sortField is set (i.e., when user explicitly clicks a sortable header)
    if (sortField) {
      return [...filtered].sort((a, b) => {
        const fieldA = a[sortField] || "";
        const fieldB = b[sortField] || "";
        if (sortDirection === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
    }

    return filtered; // Return unsorted filtered list by default
  };

  // Pagination logic
  const sortedBugs = filteredAndSortedBugs();
  const totalPages = Math.ceil(sortedBugs.length / itemsPerPage);
  const indexOfLastBug = currentPage * itemsPerPage;
  const indexOfFirstBug = indexOfLastBug - itemsPerPage;
  const currentBugs = sortedBugs.slice(indexOfFirstBug, indexOfLastBug);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage("");
    } else {
      toast.info(`Please enter a page number between 1 and ${totalPages}.`);
    }
  };

  const handleViewClick = (bug) => {
    setSelectedBug(bug);
    setDelayReason("");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBug(null);
    setDelayReason("");
  };

  const handleResolveBug = (bugId) => {
    if (!selectedBug) return;

    const isPastDeadline = new Date() > new Date(selectedBug.deadline);
    if (isPastDeadline && !delayReason.trim()) {
      toast.error("Please provide a reason for the delay.");
      return;
    }

    const payload = {
      bugId,
      ...(isPastDeadline && { delayReason }),
    };

    dispatch(resolveBug(payload)).then((result) => {
      if (result.error) {
        toast.error(`Failed to resolve bug: ${result.error.message}`);
      } else {
        dispatch(fetchBugByEmployeeId(employeeId));
        toast.success("Bug resolved successfully!");
        handleModalClose();
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSortField(null); // Reset sorting
    setSortDirection("asc");
  };

  // Loading state
  if (loading.bugsByEmployeeId) {
    return (
      <div className="p-6 space-y-4 bg-white rounded-lg shadow-md border border-gray-200">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }



  // Empty state
  if (!bugsByEmployeeId || bugsByEmployeeId.length === 0) {
    return (
      <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-800 mb-4">
          <BugIcon className="text-3xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No bugs found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {selectedStatus === "all" && selectedPriority === "all" && !searchTerm
            ? "No bugs are assigned to this employee."
            : "No bugs match your current filters. Try adjusting your search or filter criteria."}
        </p>
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2 mx-auto border-gray-300 text-gray-800 hover:bg-gray-100"
        >
          <FiX />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Assigned Issues
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bugs..."
                  className="pl-10 border-gray-300 focus:border-[#1447e6] focus:ring-[#1447e6] text-gray-800"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-800 hover:text-[#1447e6] hover:bg-gray-100"
                  >
                    <FiX className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 text-gray-800 hover:bg-gray-100"
                  >
                    <Filter />
                    <span className="hidden sm:inline">Filter</span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white border-gray-200"
                >
                  <DropdownMenuLabel className="text-gray-800">Filter by Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                    <div className="flex justify-between w-full">
                      <span>All Bugs</span>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        {bugStats.total}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("open")}>
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-gray-800">●</span>
                        Open
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-300 text-gray-800"
                      >
                        {bugStats.open}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusFilter("resolved")}
                  >
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-gray-800">●</span>
                        Resolved
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-500 text-gray-800"
                      >
                        {bugStats.resolved}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-gray-800">Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handlePriorityFilter("all")}>
                    <div className="flex justify-between w-full">
                      <span>All Priorities</span>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        {bugStats.total}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePriorityFilter("High")}
                  >
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-gray-800">●</span>
                        High
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-gray-800"
                      >
                        {bugStats.highPriority}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePriorityFilter("Medium")}
                  >
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-gray-800">●</span>
                        Medium
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-gray-800"
                      >
                        {bugStats.mediumPriority}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePriorityFilter("Low")}>
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-1.5 text-gray-800">●</span>
                        Low
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        {bugStats.lowPriority}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="justify-center text-gray-800"
                  >
                    Clear All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Bugs Table */}
      {currentBugs.length === 0 ? (
        <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-800 mb-4">
            <BugIcon className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No bugs found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {selectedStatus === "all" && selectedPriority === "all" && !searchTerm
              ? "No bugs are assigned to this employee."
              : "No bugs match your current filters. Try adjusting your search or filter criteria."}
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 mx-auto border-gray-300 text-gray-800 hover:bg-gray-100"
          >
            <FiX />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="mt-0 bg-white rounded-md shadow-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <TableHead
                  className="w-[100px] text-gray-800 cursor-pointer  text-white"
                  onClick={() => handleSort("bug_id")}
                >
                  Bug ID
                  {sortField === "bug_id" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="inline ml-1" />
                    ) : (
                      <ArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort("title")}
                >
                  Title
                  {sortField === "title" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="inline ml-1" />
                    ) : (
                      <ArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead className="text-gray-800 text-white">Project Name</TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortField === "status" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="inline ml-1" />
                    ) : (
                      <ArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead className="text-gray-800   text-white">Created At</TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort("priority")}
                >
                  Priority
                  {sortField === "priority" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="inline ml-1" />
                    ) : (
                      <ArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead className="text-gray-800 text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBugs.map((bug) => (
                <TableRow key={bug._id} className="hover:bg-gray-100">
                  <TableCell className="font-medium text-gray-800">
                    {bug.bug_id}
                  </TableCell>
                  <TableCell className="text-gray-800 max-w-xs truncate">
                    {bug.title}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {bug.projectName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        statusColors[bug.status.toLowerCase()]
                      } border capitalize`}
                    >
                      {bug.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {new Date(bug.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${priorityColors[bug.priority]} border`}>
                      {bug.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-800 hover:text-[#1447e6] hover:bg-gray-100"
                      onClick={() => handleViewClick(bug)}
                      aria-label={`View bug ${bug.bug_id}`}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 mb-10 px-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="itemsPerPage" className="text-gray-800">
                  Bugs per page:
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-24 border-gray-300 focus:ring-[#1447e6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-gray-800 hover:bg-gray-100 border-gray-300"
                >
                  Previous
                </Button>
                {[...Array(totalPages).keys()].map((page) => (
                  <Button
                    key={page + 1}
                    variant={currentPage === page + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(page + 1)}
                    className={
                      currentPage === page + 1
                        ? "bg-[#1447e6] text-white hover:bg-[#0f3cb5]"
                        : "text-gray-800 hover:bg-gray-100 border-gray-300"
                    }
                  >
                    {page + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-gray-800 hover:bg-gray-100 border-gray-300"
                >
                  Next
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="goToPage" className="text-gray-800">
                  Go to page:
                </Label>
                <Input
                  id="goToPage"
                  type="number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="w-20 border-gray-300 focus:ring-[#1447e6] text-gray-800"
                  placeholder="Page"
                  min="1"
                  max={totalPages}
                />
                <Button
                  onClick={handleGoToPage}
                  className="bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
                >
                  Go
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bug Details Dialog */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-full sm:max-w-2xl w-full bg-white border border-gray-200 shadow-md rounded-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg font-semibold">
              Bug Details
            </DialogTitle>
          </DialogHeader>

{selectedBug && (
  <div className="flex flex-col space-y-4 py-2 px-1 sm:px-2">
    {[
      { label: "Bug ID", value: selectedBug.bug_id },
      { label: "Title", value: selectedBug.title },
      {
        label: "Description",
        value: selectedBug.description || "No description provided",
      },
      { label: "Task Ref", value: selectedBug.taskRef },
      { label: "Project Id", value: selectedBug.projectId },
      {
        label: "Assigned To",
        value:
          selectedBug?.assignedToDetails?.memberName || "Unassigned",
      },
      {
        label: "Status",
        value: (
          <Badge
            className={`${
              statusColors[selectedBug.status.toLowerCase()]
            } capitalize`}
          >
            {selectedBug.status}
          </Badge>
        ),
      },
      {
        label: "Review Status",
        value: (
          <Badge
            className={`${
              reviewStatusColors[selectedBug.reviewStatus]
            } capitalize`}
          >
            {selectedBug.reviewStatus}
          </Badge>
        ),
      },
      {
        label: "Priority",
        value: (
          <Badge
            className={`${
              priorityColors[selectedBug.priority]
            } capitalize`}
          >
            {selectedBug.priority}
          </Badge>
        ),
      },
      {
        label: "Deadline",
        value: new Date(selectedBug.deadline).toLocaleDateString("en-IN"),
      },
      {
        label: "Created At",
        value: new Date(selectedBug.createdAt).toLocaleDateString("en-IN"),
      },
      // Only include Delay Reason if it exists
      selectedBug.delayReason && {
        label: "Delay reason",
        value: selectedBug.delayReason,
      },
    ]
      .filter(Boolean) // Remove falsy (null/undefined) entries
      .map(({ label, value }, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/2 font-semibold text-sm text-gray-800 mb-1 sm:mb-0 sm:pr-4">
            {label}
          </div>
          <div className="w-full sm:w-1/2 text-sm text-gray-800 whitespace-pre-wrap break-words">
            {value}
          </div>
        </div>
      ))}

    {/* Delay Reason Input - only if overdue, not resolved, and no delay reason */}
    {selectedBug.status.toLowerCase() !== "resolved" &&
      new Date() > new Date(selectedBug.deadline) &&
      !selectedBug.delayReason && (
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/2 font-semibold text-sm text-gray-800 mb-1 sm:mb-0 sm:pr-4">
            Delay Reason
          </div>
          <div className="w-full sm:w-1/2">
            <Input
              className="w-full border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-[#1447e6]"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="Enter reason for delay"
            />
          </div>
        </div>
    )}

    {/* Error Message */}
    {error.bugResolve && (
      <div className="text-gray-800 text-sm font-medium bg-gray-100 border border-gray-300 rounded p-3">
        {error.bugResolve}
      </div>
    )}
  </div>
)}


          <DialogFooter>
            {selectedBug?.status.toLowerCase() !== "resolved" && (
              <Button
                onClick={() => handleResolveBug(selectedBug.bug_id)}
                className="bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
                disabled={loading.bugResolve}
              >
                {loading.bugResolve ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Resolve Bug"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
