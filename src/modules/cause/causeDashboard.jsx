
'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCauses,
  updateCauseStatusById,
  clearCauseState,
} from "@/features/causeSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  Users,
  User,
} from "lucide-react";
import { toast } from 'sonner'
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function CauseDashboard() {
  const dispatch = useDispatch();
  const { allCauses, loading, error, submittedData } = useSelector((state) => state.cause);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "Approved" or "Rejected"
  const [currentPage, setCurrentPage] = useState(1);
  const [causesPerPage, setCausesPerPage] = useState(5);
  const [goToPage, setGoToPage] = useState("");

  // Pagination calculations
  const indexOfLastCause = currentPage * causesPerPage;
  const indexOfFirstCause = indexOfLastCause - causesPerPage;
  const currentCauses = allCauses.slice(indexOfFirstCause, indexOfLastCause);
  const totalPages = Math.ceil(allCauses.length / causesPerPage);

  // Effect: Fetch all causes on mount
  useEffect(() => {
    dispatch(getAllCauses());
    return () => {
      dispatch(clearCauseState());
    };
  }, [dispatch]);

  // Effect: Handle errors and success messages
  useEffect(() => {
    if (error) {
      toast.error(
      "Error Occured"
      );
    }
    if (submittedData) {
      toast.success(
       "Cause status updated successfully!"
   );
    }
  }, [error, submittedData]);

  // Effect: Reset to first page when causesPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [causesPerPage]);

  // Handler: Open modal with cause details
  const handleViewCause = (cause) => {
    setSelectedCause(cause);
    setNewStatus(cause.status || "Pending");
    setIsModalOpen(true);
  };

  // Handler: Open confirmation dialog for Approve/Reject
  const handleConfirmAction = (action) => {
    setConfirmAction(action);
    setIsConfirmDialogOpen(true);
  };

  // Handler: Update cause status
  const handleUpdateStatus = async () => {
    if (!selectedCause || !confirmAction) return;
    try {
      await dispatch(
        updateCauseStatusById({ id: selectedCause.showCauseId, status: confirmAction })
      ).unwrap();
      setIsConfirmDialogOpen(false);
      setIsModalOpen(false);
      setSelectedCause(null);
      setNewStatus("");
      setConfirmAction(null);
      dispatch(getAllCauses());
    } catch (err) {
      toast.error(`${err.message || "Unknown error"}`
      
      );
    }
  };

  // Handler: Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCause(null);
    setNewStatus("");
    setConfirmAction(null);
  };

  // Handler: Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  // Handler: Change page
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handler: Go to specific page
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(goToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage("");
    } else {
      toast.info(`Please enter a page number between 1 and ${totalPages}.`
       );
    }
  };

  // Loading state
  if (loading && !allCauses.length) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <span className="mt-4 text-blue-700 text-lg font-semibold">
            Loading Causes...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh]">
      <div className="bg-white rounded-xl shadow-xl ">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl p-4">
       
            <h1 className="text-xl sm:text-3xl font-bold">
              Cause Dashboard
            </h1>
         
        </div>

        {/* Causes Table */}
        <div className="p-4 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50 hover:bg-blue-50">
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Cause ID
                </TableHead>
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Meeting ID
                </TableHead>
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Reason
                </TableHead>
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Submitted By
                </TableHead>
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Status
                </TableHead>
                <TableHead className="text-blue-800 font-semibold py-4 text-sm">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCauses.length > 0 ? (
                currentCauses.map((cause) => (
                  <TableRow
                    key={cause._id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <TableCell className="text-gray-700 text-sm py-4">
                      {cause.showCauseId}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm py-4">
                      {cause.meetingId}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm py-4">
                      {cause.reason.length > 50
                        ? `${cause.reason.substring(0, 50)}...`
                        : cause.reason}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm py-4">
                      {cause.submittedBy}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cause.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : cause.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cause.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => handleViewCause(cause)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-600 py-6 text-base"
                  >
                    No causes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border-t border-blue-200">
            <div className="flex items-center space-x-3">
              <Label htmlFor="causesPerPage" className="text-blue-700 font-medium">
                Causes per page:
              </Label>
              <Select
                value={causesPerPage.toString()}
                onValueChange={(value) => setCausesPerPage(Number(value))}
              >
                <SelectTrigger className="w-24 border-blue-400 focus:ring-2 focus:ring-blue-500 bg-blue-50">
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
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {[...Array(totalPages).keys()].map((page) => (
                <Button
                  key={page + 1}
                  variant={currentPage === page + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    currentPage === page + 1
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border-blue-500 text-blue-600 hover:bg-blue-100"
                  }
                >
                  {page + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Label htmlFor="goToPage" className="text-blue-700 font-medium">
                Go to page:
              </Label>
              <Input
                id="goToPage"
                type="number"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                className="w-20 border-blue-400 focus:ring-2 focus:ring-blue-500 bg-blue-50"
                placeholder="Page"
              />
              <Button
                size="sm"
                onClick={handleGoToPage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go
              </Button>
            </div>
          </div>
        )}

        {/* View/Update Modal */}
        {selectedCause && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] bg-white rounded-2xl border border-blue-300 shadow-2xl p-6 animate-fade-in">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                  Cause Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                {/* Cause ID Section */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Hash className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-blue-700 font-semibold text-sm">Cause ID</Label>
                    <p className="text-gray-800 text-base font-medium">{selectedCause.showCauseId}</p>
                  </div>
                </div>

                {selectedCause.status === "Pending" ? (
                  <>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-2" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Meeting ID</Label>
                        <Input
                          value={selectedCause.meetingId}
                          readOnly
                          className="mt-1 border-blue-400 bg-blue-50 text-gray-800 text-sm focus:ring-0 cursor-not-allowed rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-2" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Reason</Label>
                        <Textarea
                          value={selectedCause.reason}
                          readOnly
                          className="mt-1 border-blue-400 bg-blue-50 text-gray-800 text-sm resize-none focus:ring-0 cursor-not-allowed rounded-lg"
                          rows={4}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-2" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Submitted By</Label>
                        <Input
                          value={selectedCause.submittedBy}
                          readOnly
                          className="mt-1 border-blue-400 bg-blue-50 text-gray-800 text-sm focus:ring-0 cursor-not-allowed rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-2" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Status</Label>
                        <Select
                          value={newStatus}
                          onValueChange={setNewStatus}
                          className="mt-1"
                        >
                          <SelectTrigger className="border-blue-400 focus:ring-2 focus:ring-blue-500 bg-blue-50 text-gray-800 text-sm rounded-lg">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Meeting ID</Label>
                        <div className="mt-1 p-2 bg-blue-50 border border-blue-400 rounded-lg text-gray-800 text-sm">
                          {selectedCause.meetingId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Reason</Label>
                        <div className="mt-1 p-2 bg-blue-50 border border-blue-400 rounded-lg text-gray-800 text-sm min-h-[100px]">
                          {selectedCause.reason}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Submitted By</Label>
                        <div className="mt-1 p-2 bg-blue-50 border border-blue-400 rounded-lg text-gray-800 text-sm">
                          {selectedCause.submittedBy}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <Label className="text-blue-700 font-semibold text-sm">Status</Label>
                        <div
                          className={`mt-1 p-2 border rounded-lg text-sm font-medium ${
                            selectedCause.status === "Approved"
                              ? "bg-blue-100 text-blue-800 border-blue-400"
                              : "bg-red-100 text-red-800 border-red-400"
                          }`}
                        >
                          {selectedCause.status}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 text-sm rounded-lg"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                {selectedCause.status === "Pending" && (
                  <div className="flex gap-3">
                    <div className="relative group">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                        onClick={() => handleConfirmAction("Approved")}
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        Approve this cause
                      </span>
                    </div>
                    <div className="relative group">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                        onClick={() => handleConfirmAction("Rejected")}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        Reject this cause
                      </span>
                    </div>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        {isConfirmDialogOpen && (
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl border border-blue-300 shadow-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                  {confirmAction === "Approved" ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Confirm {confirmAction}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Are you sure you want to {confirmAction.toLowerCase()} this cause (ID: {selectedCause?.showCauseId})?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-sm rounded-lg"
                  onClick={handleCloseConfirmDialog}
                >
                  Cancel
                </Button>
                <Button
                  className={`text-white text-sm rounded-lg ${
                    confirmAction === "Approved"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={handleUpdateStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default CauseDashboard;