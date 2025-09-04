






'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchAllProjects } from '@/features/projectSlice';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export default function AllBugList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const projects = useSelector((state) => state.project.projects);
  const fetchStatus = useSelector((state) => state.project.status.fetchAllProjects);
  const error = useSelector((state) => state.project.error.fetchAllProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('projectName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10
  );

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchAllProjects()).then((result) => {
        if (result.error) {
          toast.error(`Failed to fetch projects: ${result.error.message}`);
        }
      });
    }
  }, [dispatch, fetchStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory, sortField, sortDirection]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate project statistics
  const projectStats = {
    total: projects?.length || 0,
    open: projects?.filter((project) => project.status.toLowerCase() === 'open').length || 0,
    completed: projects?.filter((project) => project.status.toLowerCase() === 'completed').length || 0,
  };

  // Filter and sort projects
  const filteredAndSortedProjects = () => {
    let filtered = projects || [];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((project) => project.status.toLowerCase() === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((project) => project.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.projectName?.toLowerCase().includes(term) ||
          project.teamLeadName?.toLowerCase().includes(term) ||
          project.category?.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      if (sortDirection === 'asc') {
        return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
      } else {
        return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
      }
    });
  };

  // Pagination logic
  const sortedProjects = filteredAndSortedProjects();
  const totalItems = sortedProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSortField('projectName');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Status colors
  const statusColors = {
    open: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
  };

  // Loading state
  if (fetchStatus === 'loading') {
    return (
      <div className="p-6 space-y-4 bg-card rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8 text-center bg-card p-6 rounded-lg border">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-danger mb-2">Error loading projects</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="mt-8 text-center bg-card p-6 rounded-lg border h-[80vh]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {selectedStatus === 'all' && selectedCategory === 'all' && !searchTerm
            ? 'No projects are available.'
            : 'No projects match your current filters. Try adjusting your search or filter criteria.'}
        </p>
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2 mx-auto"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">All Bug Reports</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
              <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All Projects</span>
                  <Badge variant="secondary">{projectStats.total}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('open')}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-red-500">●</span>
                    Open
                  </div>
                  <Badge variant="secondary">{projectStats.open}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('completed')}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <span className="mr-1.5 text-green-500">●</span>
                    Completed
                  </div>
                  <Badge variant="secondary">{projectStats.completed}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleCategoryFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All Categories</span>
                  <Badge variant="secondary">{projectStats.total}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryFilter('Development')}>
                <div className="flex justify-between w-full">
                  <span>Development</span>
                  <Badge variant="secondary">
                    {projects?.filter((p) => p.category === 'Development').length || 0}
                  </Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryFilter('Testing')}>
                <div className="flex justify-between w-full">
                  <span>Testing</span>
                  <Badge variant="secondary">
                    {projects?.filter((p) => p.category === 'Testing').length || 0}
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

      {/* Projects Table */}
      {currentProjects.length === 0 ? (
        <div className="bg-card rounded-lg border text-center p-6 h-[80vh]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No projects match your current filters. Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 mx-auto"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
  <TableRow>
    <TableHead
      className="text-left text-white cursor-pointer"
      onClick={() => handleSort('projectName')}
    >
      Project Name
      {sortField === 'projectName' &&
        (sortDirection === 'asc' ? (
          <ArrowUp className="inline ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="inline ml-1 h-4 w-4" />
        ))}
    </TableHead>

    <TableHead
      className="text-left text-white cursor-pointer"
      onClick={() => handleSort('teamLeadName')}
    >
      Team Lead
      {sortField === 'teamLeadName' &&
        (sortDirection === 'asc' ? (
          <ArrowUp className="inline ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="inline ml-1 h-4 w-4" />
        ))}
    </TableHead>

    <TableHead className="text-left text-white">Category</TableHead>

    <TableHead
      className="text-left text-white cursor-pointer"
      onClick={() => handleSort('status')}
    >
      Status
      {sortField === 'status' &&
        (sortDirection === 'asc' ? (
          <ArrowUp className="inline ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="inline ml-1 h-4 w-4" />
        ))}
    </TableHead>

    <TableHead className="text-left text-white">Actions</TableHead>
  </TableRow>
</TableHeader>

              <TableBody>
                {currentProjects.map((project, index) => (
                  <TableRow key={project.projectId}>
                    <TableCell className="text-left ml-4">
                      {indexOfFirstProject + index + 1}. {project.projectName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-left ">{project.teamLeadName || 'N/A'}</TableCell>
                    <TableCell className="text-left ">{project.category || 'N/A'}</TableCell>
                    <TableCell className="text-left ">
                      <Badge
                        className={`${statusColors[project.status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'} border capitalize`}
                      >
                        {project.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left ">
                    <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="icon"
        size="sm"
        onClick={() => router.push(`/bug/projectId/?projectId=${project.projectId}`)}
        aria-label={`View project ${project.projectName}`}
        className="hover:bg-blue-50 cursor-pointer"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>View Bugs</p>
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
                Showing {currentProjects.length} of {totalItems} projects
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Rows:</label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
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
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}