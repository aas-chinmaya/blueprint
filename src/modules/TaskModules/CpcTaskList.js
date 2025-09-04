



'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllTaskList,
  selectAllTaskList,
  selectTaskStatus,
} from '@/features/taskSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiX,
} from 'react-icons/fi';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors = {
  Pending: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const priorityColors = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-orange-100 text-orange-800 border-orange-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

export default function Task() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTaskList) || [];
  const status = useSelector(selectTaskStatus);
  const [viewTask, setViewTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [goToPage, setGoToPage] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getAllTaskList());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const height = window.innerHeight;
      const calculated = Math.floor((height - 50) / 60);
      setItemsPerPage(calculated > 3 ? calculated : 3);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset to first page when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, itemsPerPage]);

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'Pending').length,
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
          task.task_id?.toString().includes(term)
      );
    }

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

    return filtered;
  };

  // Pagination logic
  const sortedTasks = filteredAndSortedTasks();
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    setSortField(null);
    setSortDirection('asc');
  };

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 border-gray-300 text-black"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600"
              >
                <FiX className="h-5 w-5" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-300 text-black hover:bg-gray-100"
              >
                <FiFilter />
                <span className="hidden sm:inline">Filter</span>
                <FiChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All Tasks</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.total}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Pending')}>
                <div className="flex justify-between w-full">
                  <span>Pending</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.pending}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('In Progress')}>
                <div className="flex justify-between w-full">
                  <span>In Progress</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.inProgress}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Completed')}>
                <div className="flex justify-between w-full">
                  <span>Completed</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.completed}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePriorityFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All Priorities</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.total}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityFilter('High')}>
                <div className="flex justify-between w-full">
                  <span>High</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.highPriority}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityFilter('Medium')}>
                <div className="flex justify-between w-full">
                  <span>Medium</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {taskStats.mediumPriority}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityFilter('Low')}>
                <div className="flex justify-between w-full">
                  <span>Low</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
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

      {/* Tasks Table */}
      {sortedTasks.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-md border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === 'all' && selectedPriority === 'all' && !searchTerm
              ? 'No tasks available.'
              : 'No tasks match your current filters. Try adjusting your search or filter criteria.'}
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 mx-auto border-gray-300 text-black hover:bg-gray-100"
          >
            <FiX />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white z-10">
              <TableRow>
                <TableHead
               className=" !text-white"
                  onClick={() => handleSort('task_id')}
                >
                  Task ID
                  {sortField === 'task_id' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="inline ml-1" />
                    ) : (
                      <FiArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead
                className=" !text-white"
                  onClick={() => handleSort('title')}
                >
                  Title
                  {sortField === 'title' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="inline ml-1" />
                    ) : (
                      <FiArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead
                  className=" !text-white"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="inline ml-1" />
                    ) : (
                      <FiArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead
                  className=" !text-white"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  {sortField === 'priority' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="inline ml-1" />
                    ) : (
                      <FiArrowDown className="inline ml-1" />
                    ))}
                </TableHead>
                <TableHead className=" !text-white">Project Name</TableHead>
                <TableHead className=" !text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>{task.task_id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn('capitalize border', statusColors[task.status] || '')}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'capitalize border',
                        priorityColors[task.priority] || ''
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.projectName || 'N/A'}</TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewTask(task)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEye />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>View Task</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="itemsPerPage" className="text-black">
              Tasks per page:
            </Label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-black"
            >
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="border-gray-300 text-black hover:bg-gray-100"
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
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-gray-300 text-black hover:bg-gray-100'
                }
              >
                {page + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Next
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="goToPage" className="text-black">
              Go to page:
            </Label>
            <Input
              id="goToPage"
              type="number"
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              className="w-20 border-gray-300 text-black"
              placeholder="Page"
              min="1"
              max={totalPages}
            />
            <Button
              onClick={handleGoToPage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go
            </Button>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewTask && (
        <Dialog open={!!viewTask} onOpenChange={() => setViewTask(null)}>
          <DialogContent className="bg-white border border-gray-200 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-black">Task Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2 text-black">
              {[
                { label: 'Task ID:', value: viewTask.task_id },
                { label: 'Project Name:', value: viewTask.projectName || 'N/A' },
                { label: 'Title:', value: viewTask.title },
                {
                  label: 'Description:',
                  value: viewTask.description || 'No description',
                },
                {
                  label: 'Status:',
                  value: (
                    <Badge
                      className={cn(
                        'capitalize border',
                        statusColors[viewTask.status] || ''
                      )}
                    >
                      {viewTask.status}
                    </Badge>
                  ),
                },
                {
                  label: 'Priority:',
                  value: (
                    <Badge
                      className={cn(
                        'capitalize border',
                        priorityColors[viewTask.priority] || ''
                      )}
                    >
                      {viewTask.priority}
                    </Badge>
                  ),
                },
                {
                  label: 'Deadline:',
                  value: viewTask.deadline
                    ? new Date(viewTask.deadline).toLocaleDateString('en-IN')
                    : 'N/A',
                },
              ].map(({ label, value }, idx) => (
                <div key={idx} className="flex justify-between">
                  <Label>{label}</Label>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}