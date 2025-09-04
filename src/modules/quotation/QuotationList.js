import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQuotations, getQuotationById, getClientStatusByQuotationId } from "@/features/quotationSlice";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Eye, ArrowLeft, Edit, Calendar, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utility function to calculate totals
const calculateTotals = (quotation) => {
  const subtotal = quotation.items.reduce(
    (sum, item) => sum + Number(item.sellPrice || 0),
    0
  );
  const taxAmount = subtotal * (quotation.taxPercent / 100);
  const total = subtotal + taxAmount;

  return {
    ...quotation,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
  };
};

export default function QuotationList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { quotations, quotation: selectedQuotation } = useSelector(
    (state) => state.quotation
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentStatusFilter, setDocumentStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch all quotations on component mount
  useEffect(() => {
    dispatch(getQuotations());
  }, [dispatch]);
const { clientStatus, loading, error } = useSelector((state) => state.quotation);

const [selectedQuotationNumber, setSelectedQuotationNumber] = useState(null);
useEffect(() => {
  if (selectedQuotationNumber) {
    dispatch(getClientStatusByQuotationId(selectedQuotationNumber));
  }
}, [selectedQuotationNumber, dispatch]);


  // Handle viewing a specific quotation
 
const handleViewQuotation = async (quotationNumber) => {
  setShowPdf(false);
  setPdfUrl(null);
  setLoadingQuotation(true);

  setSelectedQuotationNumber(quotationNumber); // Triggers the useEffect above
// console.log("Selected Quotation clientStatus:", clientStatus);
  const result = await dispatch(getQuotationById(quotationNumber));
  if (result?.payload) {
    setIsViewModalOpen(true);
  }

  setLoadingQuotation(false);
};

  // Handle editing a quotation
  const handleEditQuotation = (quotationNumber) => {
    router.push(`/quotation/edit/${quotationNumber}`);
  };

  // Handle PDF view toggle
  const handleViewPdf = () => {
    setShowPdf(true);
    setLoadingQuotation(true);


    
    if (
      typeof selectedQuotation?.pdfUrl === "string" &&
      selectedQuotation.pdfUrl.trim() !== ""
    ) {
      setPdfUrl(selectedQuotation.pdfUrl);
    } else {
      setPdfUrl(null);
    }

    setLoadingQuotation(false);
  };

  // Format currency in INR with two decimal places
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Number(amount));

  // Format date to DD-MMM-YYYY
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Filter and sort quotations

  const filteredQuotations = quotations
    ?.filter((q) => {
      const matchesSearch = (q?.quotationNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || q?.status === statusFilter;

      const matchesDocumentStatus =
        documentStatusFilter === "all" || q?.Status === documentStatusFilter;

      const qDate = q?.date ? new Date(q.date) : null;
      const matchesDate =
        (!startDate || (qDate && qDate >= new Date(startDate))) &&
        (!endDate || (qDate && qDate <= new Date(endDate)));

      return (
        matchesSearch && matchesStatus && matchesDocumentStatus && matchesDate
      );
    })
    ?.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b?.date || 0) - new Date(a?.date || 0);
      } else if (sortBy === "date-asc") {
        return new Date(a?.date || 0) - new Date(b?.date || 0);
      } else if (sortBy === "number-desc") {
        return (b?.quotationNumber || "").localeCompare(
          a?.quotationNumber || ""
        );
      } else if (sortBy === "number-asc") {
        return (a?.quotationNumber || "").localeCompare(
          b?.quotationNumber || ""
        );
      }
      return 0;
    });

  // Calculate totals for selectedQuotation if not provided
  const computedQuotation = selectedQuotation?._id
    ? calculateTotals(selectedQuotation)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search, Filter, and Sort */}
      <div className="mb-6 p-4 bg-white ">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full sm:w-auto">
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
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search by Quotation Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Approval Status</SelectItem>

                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={documentStatusFilter}
              onValueChange={setDocumentStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by Document Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Document Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
    
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="number-desc">
                  Quotation Number (Z-A)
                </SelectItem>
                <SelectItem value="number-asc">
                  Quotation Number (A-Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-blue-700 text-xl font-semibold">
                {showPdf ? "Quotation PDF Preview" : "Quotation Details"}
              </DialogTitle>
              {computedQuotation?.Status === "final" && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (showPdf) {
                        setShowPdf(false);
                        setPdfUrl(null);
                      } else {
                        handleViewPdf();
                      }
                    }}
                  >
                    {showPdf ? "Back" : "View PDF"}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div
            className={`transition-opacity duration-300 ${
              showPdf ? "opacity-100" : "opacity-100"
            }`}
          >
            {loadingQuotation ? (
              <p className="text-gray-500">Loading quotation...</p>
            ) : computedQuotation?._id ? (
              showPdf ? (
                pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="Quotation PDF"
                    className="w-full h-[80vh] border rounded transition-all duration-300"
                  />
                ) : (
                  <p className="text-red-500">
                    PDF not available for this quotation.
                  </p>
                )
              ) : (
                <div className="w-full space-y-6 text-sm text-gray-800">
                  {/* Header */}
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">
                      Quotation Number:{" "}
                      <span className="font-medium">
                        {computedQuotation?.quotationNumber}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Valid Till:{" "}
                      <span className="font-medium">
                        {formatDate(computedQuotation?.validTill)}
                      </span>
                    </p>
                  </div>

                  {/* onbarding will disale and enable here */}
              
                      {computedQuotation.status.toLowerCase() === "accepted" &&
                        clientStatus?.onboardStatus === "notonboard" && (
                          <Button
                            title="Onboard Client"
                            variant=""
                             onClick={async (e) => {
                const btn = e.currentTarget;
                btn.innerHTML = "Redirecting...";
                btn.disabled = true;
                await router.push(`/client/onboarding/auto?contactId=${computedQuotation?.contactDetails?.contactId}`);
              }}
                                        className="flex items-center justify-center gap-2 text-blue-600 border border-blue-600 bg-blue-800 hover:bg-blue-800 text-white mx-auto"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Onboard Client</span>
                          </Button>
                      )}


                  {/* Client & Provider Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-1">
                      <h3 className="text-blue-800 font-semibold text-sm mb-2">
                        Client Information
                      </h3>
                      <p>
                        <strong>Name:</strong>{" "}
                        {computedQuotation?.clientDetails?.name}
                      </p>
                      <p>
                        <strong>Company:</strong>{" "}
                        {computedQuotation?.clientDetails?.company}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {computedQuotation?.clientDetails?.email}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {computedQuotation?.clientDetails?.phone}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-1">
                      <h3 className="text-blue-800 font-semibold text-sm mb-2">
                        Prepared By
                      </h3>
                      <p>
                        <strong>Name:</strong>{" "}
                        {computedQuotation?.preparedBy?.name}
                      </p>
                      <p>
                        <strong>Designation:</strong>{" "}
                        {computedQuotation?.preparedBy?.designation}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {computedQuotation?.preparedBy?.email}
                      </p>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-1">
                    <h3 className="text-blue-800 font-semibold text-sm">
                      Project Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p className="col-span-2">
                        <strong>Title:</strong>{" "}
                        {computedQuotation?.projectTitle}
                      </p>
                      <p className="col-span-2">
                        <strong>Timeline:</strong> {computedQuotation?.timeline}
                      </p>
                      <p className="col-span-2">
                        <strong>Scope of Work:</strong>{" "}
                        {computedQuotation?.scopeOfWork}
                      </p>
                      <p className="col-span-2">
                        <strong>Deliverables:</strong>{" "}
                        {computedQuotation?.deliverables}
                      </p>
                    </div>
                  </div>

                  {/* Quotation Items */}
                  <div className="space-y-2">
                    <h3 className="text-blue-800 font-semibold text-sm">
                      Quotation Items
                    </h3>
                    <div className="overflow-auto rounded-md border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-blue-100 text-blue-800">
                          <tr>
                            <th className="px-4 py-2 text-left">Service</th>
                            <th className="px-4 py-2 text-right">Sell Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {computedQuotation?.items?.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-2">{item.serviceName}</td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(item.sellPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                      <h3 className="text-blue-800 font-semibold text-sm">
                        Payment & Tax Info
                      </h3>
                      <p>
                        <strong>Tax Percent:</strong>{" "}
                        {computedQuotation?.taxPercent}%
                      </p>
                      <p>
                        <strong>Payment Terms:</strong>{" "}
                        {computedQuotation?.paymentTerms}
                      </p>
                      <p>
                        <strong>Terms & Conditions:</strong>{" "}
                        {computedQuotation?.termsAndConditions}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                      <h3 className="text-blue-800 font-semibold text-sm">
                        Totals
                      </h3>
                      <p>
                        <strong>Subtotal:</strong>{" "}
                        {formatCurrency(computedQuotation?.subtotal)}
                      </p>
                      <p>
                        <strong>Tax Amount:</strong>{" "}
                        {formatCurrency(computedQuotation?.taxAmount)}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(computedQuotation?.total)}{" "}
                        {computedQuotation?.currency}
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Approval Status:</strong>{" "}
                      {computedQuotation?.status}
                    </p>
                    <p>
                      <strong>Document Status:</strong>{" "}
                      {computedQuotation?.Status}
                    </p>
                    {computedQuotation?.respondedAt && (
                      <p>
                        <strong>Responded At:</strong>{" "}
                        {new Date(
                          computedQuotation.respondedAt
                        ).toLocaleString()}
                      </p>
                    )}
                    {computedQuotation?.responseNotes && (
                      <p>
                        <strong>Response Notes:</strong>{" "}
                        {computedQuotation.responseNotes}
                      </p>
                    )}
                    <p>
                      <strong>Created By:</strong>{" "}
                      {computedQuotation?.createdBy}
                    </p>
                    {computedQuotation?.updatedBy && (
                      <p>
                        <strong>Updated By:</strong>{" "}
                        {computedQuotation.updatedBy}
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-500">No quotation found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quotation Table */}
      <div className="bg-white rounded-lg border border-blue-200 overflow-hidden min-h-[75vh]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <TableRow className="border-0">
                <TableHead className="w-20 text-center text-white font-semibold py-3 text-sm">
                  S.No.
                </TableHead>
                <TableHead className="text-center text-white font-semibold py-3 text-sm">
                  Quotation Number
                </TableHead>
                <TableHead className="text-center text-white font-semibold py-3 text-sm">
                  Approval Status
                </TableHead>
                <TableHead className="text-center text-white font-semibold py-3 text-sm">
                  Document Status
                </TableHead>
                <TableHead className="w-40 text-center text-white font-semibold py-3 text-sm">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations?.length > 0 ? (
                filteredQuotations.map((quotation, index) => (
                  <TableRow key={quotation._id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-center">
                      {quotation.quotationNumber}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize
                        ${
                          quotation.status === "draft"
                            ? "bg-gray-200 text-gray-800"
                            : quotation.status === "sent"
                            ? "bg-blue-200 text-blue-800"
                            : quotation.status === "accepted"
                            ? "bg-green-200 text-green-800"
                            : quotation.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : quotation.status === "expired"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {quotation.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize
                        ${
                          quotation.Status === "draft"
                            ? "bg-gray-200 text-gray-800"
                            : quotation.Status === "final"
                            ? "bg-green-200 text-green-800"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {quotation.Status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                     
                 

                        {/* <Button
                          title="View Details"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleViewQuotation(quotation.quotationNumber)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                       
                        <Button
                          title="Edit Quotation"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleEditQuotation(quotation.quotationNumber)
                          }
                          disabled={quotation.Status === "final"}
                        >
                          <Edit className="h-4 w-4" />
                        </Button> */}
                        <TooltipProvider>
  <div className="flex items-center gap-2">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          title="View Details"
          variant="ghost"
          size="icon"
          onClick={() => handleViewQuotation(quotation.quotationNumber)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>View Quotation</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          title="Edit Quotation"
          variant="ghost"
          size="icon"
          onClick={() => handleEditQuotation(quotation.quotationNumber)}
          disabled={quotation.Status === "final"}
          className="text-green-600 hover:text-green-800 disabled:opacity-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Edit Quotation</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No quotations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
