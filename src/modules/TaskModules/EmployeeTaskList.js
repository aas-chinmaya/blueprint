

'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getAllTaskByEmployeeId, updateTaskStatus } from '@/features/taskSlice';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEdit,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiCalendar,
} from 'react-icons/fi';
import { Briefcase } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Status and priority styling (black and white)
const statusColors = {
  Planned: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-green-200 text-green-900 border-green-300',
  Completed: 'bg-green-300 text-green-900 border-green-400',
};

const statusIcons = {
  Planned: <FiClock className="inline-block mr-1" />,
  'In Progress': <FiAlertCircle className="inline-block mr-1" />,
  Completed: <FiCheckCircle className="inline-block mr-1" />,
};

const priorityColors = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};
const reviewStatusColors = {
  NA: 'bg-gray-100 text-gray-800 border-gray-300',           // Neutral / Not Available
  INREVIEW: 'bg-blue-100 text-blue-800 border-blue-200',     // Info / In Review
  BUGREPORTED: 'bg-yellow-100 text-yellow-800 border-yellow-300', // Warning / Bug Reported
  RESOLVED: 'bg-green-100 text-green-800 border-green-300',  // Success / Resolved
};

const AllTasksList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { employeeTasks, isLoading, error } = useSelector((state) => state.task);
  const { employeeData, loading: userLoading } = useSelector((state) => state.user);
  const employeeId = employeeData?.employeeID;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortField, setSortField] = useState(null); // No default sorting
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(8);
  const [goToPage, setGoToPage] = useState('');

  useEffect(() => {
    if (employeeId) {
      dispatch(getAllTaskByEmployeeId(employeeId));
    }
  }, [dispatch, employeeId]);

  // Reset to first page when filters or tasksPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, tasksPerPage]);

  const tasks = employeeTasks || [];

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    planned: tasks.filter((task) => task.status === 'Planned').length,
    inProgress: tasks.filter((task) => task.status === 'In Progress').length,
    completed: tasks.filter((task) => task.status === 'Completed').length,
    highPriority: tasks.filter((task) => task.priority === 'High').length,
    mediumPriority: tasks.filter((task) => task.priority === 'Medium').length,
    lowPriority: tasks.filter((task) => task.priority === 'Low').length,
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = () => {
    let filtered = tasks;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(term) ||
          task.projectName?.toLowerCase().includes(term) ||
          task.assignedBy?.toLowerCase().includes(term) ||
          task.task_id?.toString().includes(term)
      );
    }

    // Only sort if sortField is set
    if (sortField) {
      return [...filtered].sort((a, b) => {
        const fieldA = a[sortField] || '';
        const fieldB = b[sortField] || '';
        if (sortDirection === 'asc') {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
    }

    return filtered; // Return unsorted filtered list by default
  };

  // Pagination logic
  const sortedTasks = filteredAndSortedTasks();
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

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
      setGoToPage('');
    } else {
      toast.info(`Please enter a page number between 1 and ${totalPages}.`);
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
  };

  const handleEditTask = (task) => {
    if (task.status !== 'Completed') {
      setEditTask({ ...task, delayReason: task.delayReason || '' });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = { 
        task_id: editTask.task_id, 
        status: editTask.status 
      };
      if (new Date(editTask.deadline) < new Date()) {
        payload.delayReason = editTask.delayReason || '';
      }
      const result = await dispatch(updateTaskStatus(payload));
      if (updateTaskStatus.fulfilled.match(result)) {
        toast.success('Task status updated successfully!');
        setEditTask(null);
        dispatch(getAllTaskByEmployeeId(employeeId));
      } else {
        toast.error('Failed to update task status.');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortField(null); // Reset sorting
    setSortDirection('asc');
  };

  // Check if deadline has passed
  const isdeadlinePassed = (task) => {
    return new Date(task?.deadline) < new Date();
  };

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="p-6 space-y-4 bg-white rounded-lg shadow-md border border-gray-200">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-800 mb-4">
          <FiCalendar className="text-3xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Error loading tasks
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {error}
        </p>
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
                My Tasks
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10 border-gray-300 focus:border-[#1447e6] focus:ring-[#1447e6] text-gray-800"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm('')}
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
                    <FiFilter />
                    <span className="hidden sm:inline">Filter</span>
                    <FiChevronDown />
                  </Button>
                </DropdownMenuTrigger>
               
                <DropdownMenuContent align="end" className="w-64 bg-white border-green-200">
  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>

  <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
    <div className="flex justify-between w-full">
      <span>All Tasks</span>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.total}
      </Badge>
    </div>
  </DropdownMenuItem>



  <DropdownMenuItem onClick={() => handleStatusFilter('In Progress')}>
    <div className="flex justify-between w-full">
      <div className="flex items-center">
        <FiAlertCircle className="mr-1.5 text-green-600" />
        In Progress
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.inProgress}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuItem onClick={() => handleStatusFilter('Completed')}>
    <div className="flex justify-between w-full">
      <div className="flex items-center">
        <FiCheckCircle className="mr-1.5 text-green-700" />
        Completed
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.completed}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>

  <DropdownMenuItem onClick={() => handlePriorityFilter('all')}>
    <div className="flex justify-between w-full">
      <span>All Priorities</span>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.total}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuItem onClick={() => handlePriorityFilter('High')}>
    <div className="flex justify-between w-full">
      <div className="flex items-center">
        <span className="mr-1.5 text-red-500">●</span>
        High
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.highPriority}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuItem onClick={() => handlePriorityFilter('Medium')}>
    <div className="flex justify-between w-full">
      <div className="flex items-center">
        <span className="mr-1.5 text-yellow-500">●</span>
        Medium
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.mediumPriority}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuItem onClick={() => handlePriorityFilter('Low')}>
    <div className="flex justify-between w-full">
      <div className="flex items-center">
        <span className="mr-1.5 text-green-500">●</span>
        Low
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {taskStats.lowPriority}
      </Badge>
    </div>
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuItem onClick={clearFilters} className="justify-center">
    Clear All Filters
  </DropdownMenuItem>
</DropdownMenuContent>

              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {sortedTasks.length === 0 ? (
        <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-800 mb-4">
            <FiCalendar className="text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {selectedStatus === 'all' && selectedPriority === 'all' && !searchTerm
              ? 'You have no tasks assigned to you.'
              : 'No tasks match your current filters. Try adjusting your search or filter criteria.'}
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
        <div className="mt-0 bg-white rounded-lg shadow-md border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <TableHead
                  className="w-[100px] text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort('task_id')}
                >
                  ID
                  {sortField === 'task_id' &&
                    (sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                </TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort('title')}
                >
                  Task Name
                  {sortField === 'title' &&
                    (sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                </TableHead>
                <TableHead className="text-gray-800 text-white">Project Name</TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                </TableHead>
                <TableHead className="text-gray-800 text-white">deadline</TableHead>
                <TableHead
                  className="text-gray-800 cursor-pointer text-white"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  {sortField === 'priority' &&
                    (sortDirection === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                </TableHead>
                <TableHead className="text-gray-800 text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTasks.map((task) => (
                <TableRow key={task._id} className="hover:bg-gray-100">
                  <TableCell className="font-medium text-gray-800">{task.task_id}</TableCell>
                  <TableCell className="text-gray-800 max-w-xs truncate">{task.title}</TableCell>
                  <TableCell className="text-gray-800">{task.projectName}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[task.status]} border`}>
                      {statusIcons[task.status]}
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {new Date(task.deadline).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${priorityColors[task.priority]} border`}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-800 hover:text-[#1447e6] hover:bg-gray-100"
                        onClick={() => handleViewTask(task)}
                      >
                        <FiEye className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${
                          task.status === 'Completed'
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-800 hover:text-[#1447e6] hover:bg-gray-100'
                        }`}
                        onClick={() => handleEditTask(task)}
                        disabled={task.status === 'Completed'}
                      >
                        <FiEdit className="w-5 h-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 mb-10 px-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="tasksPerPage" className="text-gray-800">
                  Tasks per page:
                </Label>
                <Select
                  value={tasksPerPage.toString()}
                  onValueChange={(value) => setTasksPerPage(Number(value))}
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
                    variant={currentPage === page + 1 ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page + 1)}
                    className={
                      currentPage === page + 1
                        ? 'bg-[#1447e6] text-white hover:bg-[#0f3cb5]'
                        : 'text-gray-800 hover:bg-gray-100 border-gray-300'
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
                <Label htmlFor="goToPage" className="text-gray-800">Go to page:</Label>
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

      {/* View Task Modal */}
      <Dialog open={!!viewTask} onOpenChange={() => setViewTask(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl w-full bg-white border border-gray-200 shadow-md rounded-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg font-semibold">Task Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-2 px-1 sm:px-2">
            {[
              { label: 'Task ID', value: viewTask?.task_id },
              { label: 'Task Name', value: viewTask?.title },
              { label: 'Description', value: viewTask?.description || 'No description provided' },
              { label: 'Project', value: viewTask?.projectName },
              { label: 'Assigned By', value: viewTask?.assignedBy },
              {
                label: 'Review Status',
                value: (
                  <Badge className={`${reviewStatusColors[viewTask?.reviewStatus]} capitalize`}>
                    {viewTask?.reviewStatus}
                  </Badge>
                ),
              },
              {
                label: 'Status',
                value: (
                  <Badge className={`${statusColors[viewTask?.status]} border capitalize`}>
                    {statusIcons[viewTask?.status]} {viewTask?.status}
                  </Badge>
                ),
              },
              {
                label: 'deadline',
                value: viewTask ? new Date(viewTask.deadline).toLocaleDateString('en-IN') : '',
              },
              {
                label: 'Priority',
                value: (
                  <Badge className={`${priorityColors[viewTask?.priority]} border capitalize`}>
                    {viewTask?.priority}
                  </Badge>
                ),
              },
              {
                label: 'Delay Reason',
                value: isdeadlinePassed(viewTask) && viewTask?.delayReason ? viewTask.delayReason : null,
              },
            ].map(({ label, value }, idx) => value && (
              <div key={idx} className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/2 font-semibold text-sm text-gray-800 mb-1 sm:mb-0 sm:pr-4">
                  {label}
                </div>
                <div className="w-full sm:w-1/2 text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl w-full bg-white border border-gray-200 shadow-md rounded-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg font-semibold">Edit Task Status</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-2 px-1 sm:px-2">
            {[
              { label: 'Task ID', value: editTask?.task_id },
              { label: 'Title', value: editTask?.title },
              { label: 'Description', value: editTask?.description },
              { label: 'Project', value: editTask?.projectName },
              { label: 'Assigned By', value: editTask?.assignedBy },
              {
                label: 'Status',
                value: (
               

                  <Select
  value={editTask?.status || ""}
  onValueChange={(value) => setEditTask({ ...editTask, status: value })}
>
  <SelectTrigger className="w-full text-black border-gray-300 focus:ring-[#1447e6] focus:text-black">
    <div className="px-3 py-2 text-sm font-semibold text-black">
      {editTask?.status ? editTask.status : (
        <span className="opacity-60">Select Status</span>
      )}
    </div>
  </SelectTrigger>
  
  <SelectContent className="text-black bg-white border border-gray-300">
    <SelectItem value="In Progress" className="text-black hover:bg-gray-100">
      In Progress
    </SelectItem>
    <SelectItem value="Completed" className="text-black hover:bg-gray-100">
      Completed
    </SelectItem>
  </SelectContent>
</Select>

                ),
              },
              {
                label: 'Delay Reason',
                value: isdeadlinePassed(editTask) && (
                  <Textarea
                    className="w-full border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400"
                    value={editTask?.delayReason}
                    onChange={(e) => setEditTask({ ...editTask, delayReason: e.target.value })}
                    placeholder="Enter reason for delay"
                  />
                ),
              },
              {
                label: 'Deadline',
                value: editTask ? new Date(editTask.deadline).toLocaleDateString('en-IN') : '',
              },
              {
                label: 'Priority',
                value: (
                  <Badge className={`${priorityColors[editTask?.priority]} border capitalize`}>
                    {editTask?.priority}
                  </Badge>
                ),
              },
            ].map(({ label, value }, idx) => value && (
              <div key={idx} className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/2 font-semibold text-sm text-gray-800 mb-1 sm:mb-0 sm:pr-4">
                  {label}
                </div>
                <div className="w-full sm:w-1/2 text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTask(null)}
              className="border-gray-300 text-gray-800 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllTasksList;


