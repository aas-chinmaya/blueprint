"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getAllApprovedContacts } from "@/features/contactSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  ArrowUpDown,
  Eye,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
 
const ContactMeetingsManager = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { Approvedcontacts, status } = useSelector((state) => state.contact);
 
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("fullName");
  const [sortOrder, setSortOrder] = useState("asc");
 
   const [currentPage, setCurrentPage] = useState(1);
    const [meetingsPerPage, setMeetingsPerPage] = useState(8);
    const [goToPage, setGoToPage] = useState('');
 
 
  // Fetch contacts on component mount
  useEffect(() => {
    dispatch(getAllApprovedContacts());
  }, [dispatch]);
 
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
 
 
  // Reset to first page when meetingsPerPage changes
    useEffect(() => {
      setCurrentPage(1);
    }, [meetingsPerPage]);
  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...Approvedcontacts];
 
    // Filter out deleted contacts
    result = result.filter((contact) => !contact.isDeleted);
 
    // Search
    if (searchTerm) {
      result = result.filter(
        (contact) =>
          (contact.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.contactId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
 
    // Sort
    result.sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";
      return sortOrder === "asc"
        ? String(fieldA).localeCompare(String(fieldB))
        : String(fieldB).localeCompare(String(fieldA));
    });
 
    return result;
  }, [Approvedcontacts, searchTerm, sortField, sortOrder]);
 
  // Handle view meetings
  const handleViewMeetings = (contactId) => {
    router.push(`/meetings/${contactId}`);
  };
 
 // Pagination logic
const indexOfLastMeeting = currentPage * meetingsPerPage;
const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
const totalPages = Math.ceil(filteredAndSortedContacts.length / meetingsPerPage);
const currentMeetings = filteredAndSortedContacts.slice(indexOfFirstMeeting, indexOfLastMeeting);
 
 
 
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
      toast.info( `Please enter a page number between 1 and ${totalPages}.`
     
      );
    }
  };
 
  return (
    <div className="min-h-screen ">
      <Card className=" overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-800 flex items-center">
            Meetings Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search */}
          <div className="relative flex-1 mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
            <Input
              placeholder="Search by name, email, company, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-300 focus:ring-blue-500 text-blue-900 rounded-lg"
            />
          </div>
 
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <TableHead
                    className="cursor-pointer text-white font-semibold"
                    onClick={() => handleSort("contactId")}
                  >
                    Contact ID
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold"
                    onClick={() => handleSort("fullName")}
                  >
                    Full Name
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold"
                    onClick={() => handleSort("phone")}
                  >
                    Phone
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-white font-semibold"
                    onClick={() => handleSort("companyName")}
                  >
                    Company
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status === "loading" ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                      <span className="text-blue-700">Loading contacts...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-blue-700 text-lg">
                        No contacts found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentMeetings.map((contact) => (
                    <TableRow key={contact._id} className="hover:bg-blue-50">
                      <TableCell>{contact.contactId || "N/A"}</TableCell>
                      <TableCell>{contact.fullName || "N/A"}</TableCell>
                      <TableCell>{contact.email || "N/A"}</TableCell>
                      <TableCell>{contact.phone || "N/A"}</TableCell>
                      <TableCell>{contact.companyName || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                            contact.status === "Accepted"
                              ? "bg-blue-100 text-blue-800"
                              : contact.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {contact.status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-500 text-blue-700 hover:bg-blue-100"
                          onClick={() => handleViewMeetings(contact.contactId)}
                          title="View Meetings"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
 
 {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="meetingsPerPage" className="text-blue-700">Meetings per page:</Label>
                <Select
                  value={meetingsPerPage.toString()}
                  onValueChange={(value) => setMeetingsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-24 border-blue-400 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
 
       
               {/* Pagination controls */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="text-blue-600 hover:bg-blue-100"
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
                                      : 'text-blue-600 hover:bg-blue-100'
                                  }
                                >
                                  {page + 1}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                Next
                              </Button>
                            </div>
 
              {/* Go to page input */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="goToPage" className="text-blue-700">Go to page:</Label>
                <Input
                  id="goToPage"
                  type="number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="w-20 border-blue-400 focus:ring-blue-500"
                  placeholder="Page"
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
 
        </CardContent>
      </Card>
    </div>
  );
};
 
export default ContactMeetingsManager;