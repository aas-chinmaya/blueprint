"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndustries,
  addIndustry,
  getIndustryById,
  updateIndustry,
  deleteIndustry,
} from "@/features/master/industriesMasterSlice";
import { validateInput } from "@/utils/sanitize";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Tag,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";

export default function Industry() {
  const dispatch = useDispatch();
  const { industries, status } = useSelector((state) => state.industries);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndustryId, setSelectedIndustryId] = useState(null);
  const [industryToDelete, setIndustryToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [industriesPerPage, setIndustriesPerPage] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 10
  );
  const [sortField, setSortField] = useState("Industryname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [inputError, setInputError] = useState("");

  const [formData, setFormData] = useState({
    Industryname: "",
  });

  useEffect(() => {
    const handleResize = () => {
      setIndustriesPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReset = () => {
    setFormData({ Industryname: "" });
    setSelectedIndustryId(null);
    setInputError("");
  };

  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const openEditModal = async (industryId) => {
    try {
      const res = await dispatch(getIndustryById(industryId)).unwrap();
      if (res) {
        setFormData({ Industryname: res.Industryname || "" });
        setSelectedIndustryId(industryId);
        setIsModalOpen(true);
      } else {
        toast.error("Failed to load industry details.");
      }
    } catch (err) {
      toast.error("Error fetching industry.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validation = validateInput(value);

    if (!validation.isValid) {
      setInputError(validation.warning);
    } else {
      setInputError("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (inputError) {
      toast.warning("Please fix input errors before submitting.");
      return;
    }

    try {
      if (selectedIndustryId) {
        await dispatch(
          updateIndustry({ id: selectedIndustryId, ...formData })
        ).unwrap();
        toast.success("Industry updated successfully.");
      } else {
        await dispatch(addIndustry(formData)).unwrap();
        toast.success("Industry created successfully.");
      }

      setIsModalOpen(false);
      dispatch(fetchIndustries());
      handleReset();
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    }
  };

  const sortedIndustries = [...industries].sort((a, b) => {
    const fieldA = a[sortField] || "";
    const fieldB = b[sortField] || "";
    return sortOrder === "asc"
      ? String(fieldA).localeCompare(String(fieldB))
      : String(fieldB).localeCompare(String(fieldA));
  });

  const totalItems = sortedIndustries.length;
  const totalPages = Math.ceil(totalItems / industriesPerPage);
  const indexOfLastIndustry = currentPage * industriesPerPage;
  const indexOfFirstIndustry = indexOfLastIndustry - industriesPerPage;
  const currentIndustries = sortedIndustries.slice(
    indexOfFirstIndustry,
    indexOfLastIndustry
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Industries</h1>
        <Dialog
          open={isModalOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) handleReset();
            setIsModalOpen(isOpen);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Industry
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedIndustryId ? "Edit Industry Type" : "Add New Industry Type"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2 ">
              <div>
                <Label className="mb-2">Industry Name *</Label>
                <Input
                  name="Industryname"
                  value={formData.Industryname}
                  onChange={handleInputChange}
                  required
                />
                {inputError && (
                  <p className="text-sm text-danger mt-1">{inputError}</p>
                )}
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-700">
                  {selectedIndustryId ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <TableRow>
                <TableHead className="text-center w-20 text-white">S.No.</TableHead>
                <TableHead
                  className="text-center cursor-pointer text-white"
                  onClick={() => handleSort("industryId")}
                >
                  <div className="flex items-center justify-center">
                    Industry ID
                    {sortField === "industryId" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer text-white"
                  onClick={() => handleSort("Industryname")}
                >
                  <div className="flex items-center justify-center">
                    Industry Name
                    {sortField === "Industryname" && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center w-32 text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status === "loading" ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : totalItems === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground h-[80vh]"
                  >
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    No industries found.
                  </TableCell>
                </TableRow>
              ) : (
                currentIndustries.map((industry, index) => (
                  <TableRow key={industry._id}>
                    <TableCell className="text-center">
                      {indexOfFirstIndustry + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {industry.industryId}
                    </TableCell>
                    <TableCell className="text-center">
                      {industry.Industryname}
                    </TableCell>
                    <TableCell className="text-center">

                      <TooltipProvider>
                        <div className="flex justify-center space-x-6">

                          {/* Edit Button with Tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-4 py-2 text-blue-600  hover:text-blue-800 hover:border-blue-800"
                                onClick={() => openEditModal(industry.industryId)}
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          {/* Delete Button with Tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-4 py-2 text-red-600  hover:text-red-800 hover:border-red-800"
                                onClick={() => {
                                  setIndustryToDelete(industry.industryId);
                                  setIsDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
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
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {currentIndustries.length} of {totalItems} items
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Rows:</Label>
                <Select
                  value={industriesPerPage.toString()}
                  onValueChange={(value) => {
                    setIndustriesPerPage(Number(value));
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

      {/* Delete Confirmation */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIndustryToDelete(null);
          setIsDeleteConfirmOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete this industry? This action cannot
              be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (industryToDelete) {
                  dispatch(deleteIndustry(industryToDelete))
                    .unwrap()
                    .then(() => {
                      toast.success("Industry deleted successfully.");
                      dispatch(fetchIndustries());
                      setCurrentPage(1);
                    })
                    .catch(() => {
                      toast.error("Failed to delete industry.");
                    })
                    .finally(() => {
                      setIsDeleteConfirmOpen(false);
                      setIndustryToDelete(null);
                    });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
