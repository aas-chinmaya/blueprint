


'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjects, clearProjects, deleteProject } from '@/features/projectSlice';
import { useRouter } from 'next/navigation';
import {
  FiPaperclip,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiTrash2, // Added delete icon
} from 'react-icons/fi';
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'; // Added Dialog components for confirmation modal
import Spinner from '@/components/loader/Spinner';

const statusColors = {
  Planned: 'bg-amber-100 text-amber-800 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusIcons = {
  Planned: <FiClock className="inline-block mr-1" />,
  'In Progress': <FiAlertCircle className="inline-block mr-1" />,
  Completed: <FiCheckCircle className="inline-block mr-1" />,
};

const progressColors = {
  Planned: 'bg-amber-400',
  'In Progress': 'bg-blue-400',
  Completed: 'bg-emerald-400',
};

export default function FetchAllProjects() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { projects, status, error, successMessage } = useSelector((state) => state.project);

  // State for filters, sorting, and modal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('null');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteProjectId, setDeleteProjectId] = useState(null); // Track project to delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state

  useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);

  // Calculate project statistics
  const projectStats = projects
    ? {
        total: projects.length,
        planned: projects.filter((p) => p.status === 'Planned').length,
        inProgress: projects.filter((p) => p.status === 'In Progress').length,
        completed: projects.filter((p) => p.status === 'Completed').length,
      }
    : { total: 0, planned: 0, inProgress: 0, completed: 0 };

  const filteredAndSortedProjects = () => {
    if (!Array.isArray(projects)) return [];

    let filtered = projects;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((project) => project.status === selectedStatus);
    }

    // Filter by search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          (project.projectName?.toLowerCase()?.includes(term) || false) ||
          (project.teamLeadName?.toLowerCase()?.includes(term) || false) ||
          (project.projectId?.toString()?.includes(term) || false)
      );
    }

    // Sort if sortField is set
    if (sortField !== 'null') {
      return [...filtered].sort((a, b) => {
        const fieldA = (a[sortField] || '').toString().toLowerCase();
        const fieldB = (b[sortField] || '').toString().toLowerCase();

        if (sortDirection === 'asc') {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
    }

    return filtered;
  };

  const sortedProjects = filteredAndSortedProjects();

  const handleViewProject = (projectId) => {
    router.push(`/project/${projectId}`);
  };

  const handleOnboarding = () => {
    router.push('/project/onboarding');
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSortField('projectName');
    setSortDirection('asc');
  };

  // Handle delete project
  const handleDeleteProject = (projectId) => {
    setDeleteProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (deleteProjectId) {
      await dispatch(deleteProject(deleteProjectId));
        dispatch(fetchAllProjects());
      setIsDeleteModalOpen(false);
      setDeleteProjectId(null);
    }
  };


    const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);
  if (status.fetchAllProjects === 'loading' || showLoader) {
    return (
       <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)]"> {/* adjust height if header is fixed */}
        <Spinner />
      </div>
    );
  }
  if (status.fetchAllProjects === 'failed') {
    return (
      <div className="container mx-auto">
        <Card className="bg-destructive/10 border-destructive/20 text-destructive p-6 mx-auto">
          <CardHeader>
            <h3 className="text-lg font-semibold">Unable to load projects</h3>
          </CardHeader>
          <CardContent>
            <p>{error.fetchAllProjects || 'We encountered an issue while loading your projects. Please try again.'}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchAllProjects())}
              className="flex items-center gap-2"
              aria-label="Retry loading projects"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen">
      {/* Header */}
  
<div className="text-green-700 border-b border-border overflow-x-auto">
  <div className="mx-auto py-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">All Projects</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-[200px] md:w-[220px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 w-full"
            aria-label="Search projects"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              aria-label="Clear search"
            >
              <FiX className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-[200px] ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-between text-blue-800" aria-label="Filter and sort projects">
                <FiFilter aria-hidden="true" />
                <span className="">Filter</span>
                <FiChevronDown aria-hidden="true" />
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
              <DropdownMenuItem onClick={() => handleStatusFilter('Planned')}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <FiClock className="mr-1.5 text-amber-500" />
                    Planned
                  </div>
                  <Badge variant="secondary">{projectStats.planned}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('In Progress')}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <FiAlertCircle className="mr-1.5 text-blue-500" />
                    In Progress
                  </div>
                  <Badge variant="secondary">{projectStats.inProgress}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Completed')}>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <FiCheckCircle className="mr-1.5 text-emerald-500" />
                    Completed
                  </div>
                  <Badge variant="secondary">{projectStats.completed}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleSort('projectName')}>
                <div className="flex justify-between w-full">
                  <span>Project Name</span>
                  {sortField === 'projectName' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="ml-2" />
                    ) : (
                      <FiArrowDown className="ml-2" />
                    ))}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('projectId')}>
                <div className="flex justify-between w-full">
                  <span>Project ID</span>
                  {sortField === 'projectId' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="ml-2" />
                    ) : (
                      <FiArrowDown className="ml-2" />
                    ))}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('status')}>
                <div className="flex justify-between w-full">
                  <span>Status</span>
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? (
                      <FiArrowUp className="ml-2" />
                    ) : (
                      <FiArrowDown className="ml-2" />
                    ))}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters} className="justify-center">
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleOnboarding}
          className="w-full sm:w-[200px]  bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
          aria-label="Create new project"
        >
          <FiPlus />
          <span className="">Create</span>
        </Button>
      </div>
    </div>
  </div>
</div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Project Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              aria-label="Cancel project deletion"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProject}
              disabled={status.deleteProject === 'loading'}
              aria-label="Confirm project deletion"
            >
              {status.deleteProject === 'loading' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Projects Grid */}
      {sortedProjects.length === 0 ? (
        <Card className="mt-8 text-center">
          <CardContent className="pt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <FiPaperclip className="text-3xl" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {selectedStatus === 'all' && !searchTerm
                ? "You haven't created any projects yet. Get started by creating your first project."
                : 'No projects match your current filters. Try adjusting your search or filter criteria.'}
            </p>
            <Button
              onClick={selectedStatus !== 'all' || searchTerm ? clearFilters : handleOnboarding}
              className="flex items-center gap-2 mx-auto bg-blue-700 hover:bg-blue-700"
              aria-label={selectedStatus !== 'all' || searchTerm ? 'Clear filters' : 'Create new project'}
            >
              {selectedStatus !== 'all' || searchTerm ? <FiX aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
              {selectedStatus !== 'all' || searchTerm ? 'Clear Filters' : 'Create New Project'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {sortedProjects.map((project) => (
            <Card
              key={project.projectId}
              className="group relative hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewProject(project.projectId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleViewProject(project.projectId)}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${progressColors[project.status]}`} />
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`${statusColors[project.status]} border`}>
                    {statusIcons[project.status]}
                    {project.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/10 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.projectId);
                    }}
                    aria-label={`Delete project ${project.projectName}`}
                  >
                    <FiTrash2 className="w-5 h-5 text-destructive group-hover:text-destructive-dark" />
                  </Button>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary line-clamp-2">
                  {project.projectName || 'Unnamed Project'}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground group-hover:text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:bg-primary/10">
                      <Briefcase className="w-4 h-4 text-[#1447e6] group-hover:text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium">ID: {project.projectId}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground group-hover:text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:bg-primary/10">
                      <FiUser className="w-4 h-4 text-[#1447e6] group-hover:text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium">{project.teamLeadName || 'Unassigned'}</span>
                  </div>
                  

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Progress</span>
                      <span className="text-xs font-bold text-foreground">
                        {project.progress
                          ? `${project.progress}%`
                          : project.status === 'Completed'
                          ? '100%'
                          : project.status === 'In Progress'
                          ? '60%'
                          : '0%'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColors[project.status]}`}
                        style={{
                          width: project.progress
                            ? `${project.progress}%`
                            : project.status === 'Completed'
                            ? '100%'
                            : project.status === 'In Progress'
                            ? '60%'
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t border-border">
                <Button
                  variant="link"
                  className="w-full justify-between text-[#1447e6] text-md font-bold group-hover:text-primary-dark"
                  onClick={() => handleViewProject(project.projectId)}
                  aria-label={`View details for project ${project.projectName}`}
                >
                  View Project Details
                  <FiChevronDown
                    className="w-4 h-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}