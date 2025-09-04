
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllContacts,
  getContactById,
  deleteContact,
  updateContactStatus,
  clearSelectedContact,
} from "@/features/contactSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  MessageSquare,
  Clock,
  Tag,
  X,
  Edit,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const ContactsList = () => {
  const dispatch = useDispatch();
  const { contacts, selectedContact, status, error } = useSelector((state) => state.contact);

  // State for search, sort, filter, pagination, and modals
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("fullName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage, setContactsPerPage] = useState(8);
  const [goToPageError, setGoToPageError] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch contacts on component mount
  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  // Handle view contact
  const handleViewContact = (contactId) => {
    dispatch(getContactById(contactId));
    setIsViewModalOpen(true);
  };

  // Handle delete contact
  const openDeleteModal = (contactId) => {
    setSelectedContactId(contactId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteContact = () => {
    setIsDeleting(true);
    dispatch(deleteContact(selectedContactId)).then((result) => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Contact deleted successfully.");
        dispatch(getAllContacts()); 
      } else {
        toast.error("Failed to delete contact.");
      }
    });
  };

  // Handle status update
  const handleStatusUpdate = () => {
    if (selectedContactId && newStatus) {
      dispatch(
        updateContactStatus({
          contactId: selectedContactId,
          status: newStatus,
          feedback: feedback,
        })
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Status updated successfully.");
          dispatch(getAllContacts()); 
        } else {
          toast.error("Failed to update status.");
        }
      });
      setIsStatusModalOpen(false);
      setNewStatus("");
      setFeedback("");
    }
  };

  // Open status update modal
  const openStatusModal = (contactId) => {
    setSelectedContactId(contactId);
    setIsStatusModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    dispatch(clearSelectedContact());
  };

  // Reset date range
  const resetDateRange = () => {
    setDateRange({ from: null, to: null });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Reset to first page when contactsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [contactsPerPage]);

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Filter out deleted contacts
    result = result.filter((contact) => !contact.isDeleted);

    // Search
    if (searchTerm) {
      result = result.filter(
        (contact) =>
          (contact.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.contactId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.industry || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.referralSource || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((contact) => contact.status === filterStatus);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      result = result.filter((contact) =>
        contact.createdAt
          ? isWithinInterval(parseISO(contact.createdAt), {
              start: dateRange.from,
              end: dateRange.to,
            })
          : false
      );
    }

    // Sort
    result.sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";
      if (sortField === "createdAt" || sortField === "updatedAt") {
        const dateA = fieldA ? parseISO(fieldA) : new Date(0);
        const dateB = fieldB ? parseISO(fieldB) : new Date(0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortField === "serviceInterest") {
        const valueA = fieldA.join ? fieldA.join(", ") : "";
        const valueB = fieldB.join ? fieldB.join(", ") : "";
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return sortOrder === "asc"
        ? String(fieldA).localeCompare(String(fieldB))
        : String(fieldB).localeCompare(String(fieldA));
    });

    return result;
  }, [contacts, searchTerm, sortField, sortOrder, filterStatus, dateRange]);

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredAndSortedContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredAndSortedContacts.length / contactsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPageError("");
    }
  };



  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            All Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-success" />
              <Input
                placeholder="Search by name, email, company, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border rounded-lg"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 border rounded-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border text-foreground hover:bg-muted rounded-lg"
                  >
                    <Calendar className="h-5 w-5 mr-2 text-success" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                      : "Select Date Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                    className="bg-card text-card-foreground"
                  />
                </PopoverContent>
              </Popover>
              {dateRange.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-danger hover:bg-muted"
                  onClick={resetDateRange}
                  title="Reset Date Range"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader >
                <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <TableHead
                    className="cursor-pointer text-white font-semibold min-w-[100px]"
                    onClick={() => handleSort("contactId")}
                  >
                    Contact ID
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold min-w-[120px]"
                    onClick={() => handleSort("fullName")}
                  >
                    Full Name
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold  text-white min-w-[150px]"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold min-w-[100px]"
                    onClick={() => handleSort("phone")}
                  >
                    Phone
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead
                    className="text-white cursor-pointer font-semibold min-w-[120px]"
                    onClick={() => handleSort("companyName")}
                  >
                    Company
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead className="font-semibold min-w-[100px] text-white">Status</TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold min-w-[120px]"
                    onClick={() => handleSort("createdAt")}
                  >
                    Inquiry Date
                    <ArrowUpDown className="inline ml-2 h-4 w-4 text-success" />
                  </TableHead>
                  <TableHead className="text-white font-semibold min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status === "loading" ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-success" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        <span className="text-lg font-medium text-foreground">
                          No contacts found matching your criteria.
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Try adjusting your search or filters.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentContacts.map((contact) => (
                    <TableRow key={contact._id} className="hover:bg-muted/50">
                      <TableCell className="whitespace-nowrap">{contact.contactId || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{contact.fullName || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{contact.email || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{contact.phone || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{contact.companyName || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                            contact.status === "Accepted"
                              ? "bg-success text-success-foreground"
                              : contact.status === "Pending"
                              ? "bg-warning text-warning-foreground"
                              : "bg-danger text-danger-foreground"
                          )}
                        >
                          {contact.status === "Accepted" ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : contact.status === "Pending" ? (
                            <AlertCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {contact.status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {contact.createdAt
                          ? format(parseISO(contact.createdAt), "PPP")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                     
                        <TooltipProvider>
  <div className="flex space-x-2">
    {/* View Button with Tooltip */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className=" text-green-600 "
          onClick={() => handleViewContact(contact.contactId)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>View</TooltipContent>
    </Tooltip>

    {/* Edit Button with Tooltip */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className=" text-blue-600 "
          onClick={() => openStatusModal(contact.contactId)}
          disabled={contact.status === "Accepted"}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Update Status</TooltipContent>
    </Tooltip>

    {/* Delete Button with Tooltip */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className=" text-red-600 "
          onClick={() => openDeleteModal(contact.contactId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Delete</TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>

                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
              <div className="flex items-center space-x-2">
                <Label htmlFor="contactsPerPage" className="text-foreground">Contacts per page:</Label>
                <Select
                  value={contactsPerPage.toString()}
                  onValueChange={(value) => setContactsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-24 border rounded-lg">
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
                  className="text-primary hover:bg-primary hover:text-primary-foreground"
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
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-primary hover:bg-primary hover:text-primary-foreground"
                    }
                  >
                    {page + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Next
                </Button>
              </div>
             
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Contact Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-full sm:max-w-4xl max-h-[85vh] overflow-y-auto rounded-lg">
          <DialogHeader className="bg-blue-100 text-blue-800 p-4 rounded-t-lg ">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <User className="h-6 w-6 mr-2 text-success" />
              Contact Details
            </DialogTitle>
          </DialogHeader>
          {status === "loading" && !selectedContact ? (
            <div className="flex flex-col items-center py-8">
                
              <Loader2 className="h-8 w-8 animate-spin text-success" />
              <span>Loading contact details...</span>
            </div>
          ) : error && !selectedContact ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : selectedContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6">
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Contact ID:</strong> {selectedContact.contactId || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Full Name:</strong> {selectedContact.fullName || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Email:</strong> {selectedContact.email || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Phone:</strong> {selectedContact.phone || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Company:</strong> {selectedContact.companyName || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Designation:</strong> {selectedContact.designation || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Industry:</strong> {selectedContact.industry || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Location:</strong> {selectedContact.location || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Service Interest:</strong>{" "}
                  {selectedContact.serviceInterest?.join(", ") || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Referral Source:</strong> {selectedContact.referralSource || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Message:</strong> {selectedContact.message || "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Feedback:</strong> {selectedContact.feedback || "Feedback not provided"}
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      selectedContact.status === "Accepted"
                        ? "bg-success text-success-foreground"
                        : selectedContact.status === "Pending"
                        ? "bg-warning text-warning-foreground"
                        : "bg-danger text-danger-foreground"
                    )}
                  >
                    {selectedContact.status === "Accepted" ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : selectedContact.status === "Pending" ? (
                      <AlertCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {selectedContact.status || "N/A"}
                  </span>
                </p>
              </div>
              
            
            </div>
          ) : (
            <div className="text-lg p-6 text-center">No contact selected.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={() => setIsStatusModalOpen(false)}>
        <DialogContent className="max-w-full sm:max-w-md rounded-lg">
          <DialogHeader className="bg-blue-100 text-blue-800 p-4 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Tag className="h-5 w-5 mr-2 text-success" />
              Update Contact Status
            </DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="p-4 space-y-4">
            <Select onValueChange={setNewStatus} value={newStatus}>
              <SelectTrigger className="border rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <label className="font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-success" />
                Feedback
              </label>
              <Input
                placeholder="Enter feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border rounded-lg"
              />
            </div>
            <Button
              className="bg-blue-700 w-full"
              onClick={handleStatusUpdate}
              disabled={!newStatus}
            >
              Submit
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={() => setIsDeleteModalOpen(false)}>
        <DialogContent className="max-w-full sm:max-w-md rounded-lg">
          <DialogHeader className="bg-blue-100 text-blue-800 p-4 rounded-t-lg">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-danger" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-foreground">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="p-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="border text-foreground hover:bg-muted"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-500"
              onClick={handleDeleteContact}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactsList;