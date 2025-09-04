
"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, Edit, Download, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { fetchBugByProjectId, clearProjectBugs, downloadBugsByProjectId, downloadBugsByMemberId } from '@/features/bugSlice';
import { getTeamMembersByProjectId } from '@/features/teamSlice';
import { toast } from 'sonner';
import Spinner from '@/components/loader/Spinner';
const ProjectWiseBugList = ({ project, projectId, teamLeadId }) => {
  const dispatch = useDispatch();
  const {
    bugsByProjectId,
    loading: bugLoading,
    error: bugError,
  } = useSelector((state) => ({
    bugsByProjectId: state.bugs.bugsByProjectId,
    loading: {
      bugsByProjectId: state.bugs.loading.bugsByProjectId,
      bugDownload: state.bugs.loading.bugDownload,
      memberBugDownload: state.bugs.loading.memberBugDownload,
    },
    error: {
      bugsByProjectId: state.bugs.error.bugsByProjectId,
      bugDownload: state.bugs.error.bugDownload,
      memberBugDownload: state.bugs.error.memberBugDownload,
    },
  }));

  const { teamMembersByProjectId, status: teamStatus, error: teamError } = useSelector(
    (state) => state.team
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('bug_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [downloadTeamMember, setDownloadTeamMember] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [bugsPerPage, setBugsPerPage] = useState(() => typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 10);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [modalTeamMember, setModalTeamMember] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Fetch bugs and team members when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchBugByProjectId(projectId));
      dispatch(getTeamMembersByProjectId(projectId));
    }
    return () => {
      dispatch(clearProjectBugs());
    };
  }, [dispatch, projectId]);

  // Responsive pagination
  useEffect(() => {
    const handleResize = () => {
      setBugsPerPage(window.innerWidth < 768 ? 5 : 10);
      setCurrentPage(1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use Redux bugs data
  const bugs = bugsByProjectId || [];

  // Handle loading and error states for bugs and team members
//  if (bugLoading.bugsByProjectId || teamStatus === 'loading') {
//   return (
//     <div className="p-4 flex flex-col items-center justify-center gap-2 text-center">
//       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//     </div>
//   );
// }

     const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);
  if (bugLoading.bugsByProjectId || teamStatus === 'loading' || showLoader) {
    return (
       <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)]"> {/* adjust height if header is fixed */}
        <Spinner />
      </div>
    );
  }


  // Team members for filter (from Redux store)
  const teamMembers = [
    { memberId: 'All', memberName: 'All' },
    ...(Array.isArray(teamMembersByProjectId) ? teamMembersByProjectId : []),
  ];
  const teamMembersForModal = teamMembers.filter(member => member.memberId !== 'All');

  // Sort and filter bugs
  const filteredBugs = bugs
    .filter(bug => bug.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let fieldA = '';
      let fieldB = '';
      if (sortField === 'assignedToDetails') {
        fieldA = String(a.assignedToDetails?.memberName || '').toLowerCase();
        fieldB = String(b.assignedToDetails?.memberName || '').toLowerCase();
      } else {
        fieldA = String(a[sortField] || '').toLowerCase();
        fieldB = String(b[sortField] || '').toLowerCase();
      }
      return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    });

  // Pagination logic
  const totalItems = filteredBugs.length;
  const totalPages = Math.ceil(totalItems / bugsPerPage);
  const indexOfLastBug = currentPage * bugsPerPage;
  const indexOfFirstBug = indexOfLastBug - bugsPerPage;
  const currentBugs = filteredBugs.slice(indexOfFirstBug, indexOfLastBug);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle download for main download button
  const handleDownload = async () => {
    if (downloadTeamMember === 'All') {
      dispatch(downloadBugsByProjectId(projectId));
      toast.success('Bug report downloaded successfully');
    } else {
      dispatch(downloadBugsByMemberId({ projectId, memberId: downloadTeamMember }));
      toast.success('Bug report downloaded successfully');
    }
  };



const handleModalDownload = async () => {
  if (modalTeamMember) {
    const result = await dispatch(
      downloadBugsByMemberId({ projectId, memberId: modalTeamMember })
    );

    if (result.type.includes('fulfilled')) {
      toast.success('Individual report downloaded successfully');
    } else {
      // console.log(result); // Helpful for debugging
      toast.error('No bugs found or error occurred');
    }

    setIsIndividualModalOpen(false);
    setModalTeamMember('');
  }
};


  // Handle view bug
  const handleViewBug = (bug) => {
    setSelectedBug(bug);
    setIsViewModalOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = () => {
    if (selectedBug && newStatus) {
      // TODO: Dispatch an action to update the bug status (e.g., updateBugStatus)
      // dispatch(updateBugStatus({ bugId: selectedBug.bug_id, status: newStatus }));
      setIsUpdateModalOpen(false);
      setSelectedBug(null);
      setNewStatus('');
    }
  };

  return (
    <div className="py-2 ">
      {/* Header Section */}
      <div className="  rounded-lg mb-4 flex flex-col gap-4 ">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
            <Input
              placeholder="Search by bug title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/3 border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Select value={downloadTeamMember} onValueChange={setDownloadTeamMember}>
              <SelectTrigger className="w-full sm:w-1/4 border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.memberId} value={member.memberId}>
                    {member.memberName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
  <Button
    onClick={handleDownload}
    disabled={bugLoading.bugDownload || bugLoading.memberBugDownload}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:bg-blue-300 w-full sm:w-1/2 lg:w-auto px-4 py-2"
  >
    <Download className="h-4 w-4 sm:mr-2 hidden sm:block" />
    {bugLoading.bugDownload || bugLoading.memberBugDownload
      ? 'Downloading...'
      : 'Download Report'}
  </Button>
  <Button
    onClick={() => setIsIndividualModalOpen(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm w-full sm:w-1/2 lg:w-auto px-4 py-2"
  >
    <User className="h-4 w-4 sm:mr-2 hidden sm:block" />
    Individual Report
  </Button>
</div>

        </div>
      
      </div>

      {/* Individual Report Modal */}
      <Dialog open={isIndividualModalOpen} onOpenChange={setIsIndividualModalOpen}>
        <DialogContent className="sm:max-w-md bg-blue-50">
          <DialogHeader>
            <DialogTitle className="text-black font-bold">Download Individual Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-black font-bold text-sm">Select Team Member</label>
              <Select value={modalTeamMember} onValueChange={setModalTeamMember}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembersForModal.map(member => (
                    <SelectItem key={member.memberId} value={member.memberId}>
                      {member.memberName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsIndividualModalOpen(false);
                setModalTeamMember('');
              }}
              className="border-blue-300 text-black hover:bg-blue-100 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalDownload}
              disabled={!modalTeamMember || bugLoading.memberBugDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:bg-blue-300 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {bugLoading.memberBugDownload ? 'Downloading...' : 'Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bug Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md bg-blue-50">
          <DialogHeader>
            <DialogTitle className="text-black font-bold">Bug Details</DialogTitle>
          </DialogHeader>
          {selectedBug && (
            <div className="space-y-4 mt-2 text-black">
              <div>
                <strong className="font-bold">Bug ID:</strong> {selectedBug.bug_id}
              </div>
              <div>
                <strong className="font-bold">Title:</strong> {selectedBug.title}
              </div>
              <div>
                <strong className="font-bold">Status:</strong> {selectedBug.status}
              </div>
              <div>
                <strong className="font-bold">Assigned To:</strong> {selectedBug?.assignedToDetails?.memberName || 'Unassigned'}
              </div>
              <div>
                <strong className="font-bold">Priority:</strong> {selectedBug.priority}
              </div>
              <div>
                <strong className="font-bold">Created At:</strong>{' '}
                {new Date(selectedBug.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div>
                <strong className="font-bold">Description:</strong> {selectedBug.description}
              </div>
            </div>
          )}
      
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md bg-blue-50">
          <DialogHeader>
            <DialogTitle className="text-black font-bold">Update Bug Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-black font-bold text-sm">Select New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setNewStatus('');
                setSelectedBug(null);
              }}
              className="border-blue-300 text-black hover:bg-blue-100 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus}
              className="bg-blue-600 hover:bg-blue-700 text-black font-semibold disabled:bg-blue-300 text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bug Table */}
      <div className="bg-white rounded-lg border border-blue-200 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <TableRow>
              <TableHead className="text-black font-bold text-center cursor-pointer  text-white" onClick={() => handleSort('bug_id')}>
                <div className="flex items-center justify-center">
                  Bug ID
                  {sortField === 'bug_id' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center cursor-pointer text-white" onClick={() => handleSort('title')}>
                <div className="flex items-center justify-center">
                  Title
                  {sortField === 'title' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center text-white cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center justify-center">
                  Status
                  {sortField === 'status' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center cursor-pointer" onClick={() => handleSort('assignedToDetails')}>
                <div className="flex items-center justify-center text-white">
                  Assigned To
                  {sortField === 'assignedToDetails' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center cursor-pointer text-white" onClick={() => handleSort('priority')}>
                <div className="flex items-center justify-center">
                  Priority
                  {sortField === 'priority' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center cursor-pointer text-white" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center justify-center">
                  Created At
                  {sortField === 'createdAt' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-2" /> : <ArrowDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-black font-bold text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBugs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-black">
                  No bugs found.
                </TableCell>
              </TableRow>
            ) : (
              currentBugs.map(bug => (
                <TableRow key={bug.bug_id}>
                  <TableCell className="text-center">{bug.bug_id}</TableCell>
                  <TableCell className="text-center">{bug.title}</TableCell>
                  <TableCell className="text-center">{bug.status}</TableCell>
                  <TableCell className="text-center">{bug?.assignedToDetails?.memberName || 'Unassigned'}</TableCell>
                  <TableCell className="text-center">{bug.priority}</TableCell>
                  <TableCell className="text-center">
                    {new Date(bug.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBug(bug)}
                        className="border-blue-300 text-black hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBug(bug);
                          setIsUpdateModalOpen(true);
                        }}
                        className="border-blue-300 text-black hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-blue-200">
            <div className="text-sm text-black">
              Showing {currentBugs.length} of {totalItems} items
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-black font-bold">Rows:</span>
                <Select
                  value={bugsPerPage.toString()}
                  onValueChange={(value) => {
                    setBugsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm">
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
                  className="border-blue-300 text-black hover:bg-blue-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 text-sm text-black">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-blue-300 text-black hover:bg-blue-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWiseBugList;