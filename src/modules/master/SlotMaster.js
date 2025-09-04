"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSlots,
  createSlot,
  deleteSlot,
} from "@/features/master/slotMasterSlice";
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
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SlotMaster() {
  const dispatch = useDispatch();
  const { slots, loading } = useSelector((state) => state.slots);

  const [openModal, setOpenModal] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shift, setShift] = useState("");
  const [inputError, setInputError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [slotsPerPage, setSlotsPerPage] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 10
  );

  useEffect(() => {
    dispatch(fetchAllSlots());
    const handleResize = () => {
      setSlotsPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (startTime) {
      const [hours] = startTime.split(":").map(Number);
      if (hours < 12) setShift("Morning");
      else if (hours < 16) setShift("Day");
      else if (hours < 20) setShift("Afternoon");
      else setShift("Evening");
    } else {
      setShift("");
    }
  }, [startTime]);

  const handleReset = () => {
    setStartTime("");
    setEndTime("");
    setShift("");
    setInputError("");
  };

  const handleCreate = () => {
    if (!validateInput(startTime) || !validateInput(endTime)) {
      toast.error("Start and end time are required");
      return;
    }

    // Validate correct time format and logical consistency
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Invalid time input format.");
      return;
    }

    if (start >= end) {
      toast.error("Start time must be before end time");
      return;
    }

    if (!validateInput(shift)) {
      toast.error("Invalid shift");
      return;
    }

    dispatch(createSlot({ startTime, endTime, shift }))
      .unwrap()
      .then(() => {
        toast.success("Slot created!");
        setOpenModal(false);
        setStartTime("");
        setEndTime("");
        setShift("");
        setOpenModal(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        const message = err?.message || "An unexpected error occurred";
        toast.error(message);
      });
  };

  const totalItems = slots.length;
  const totalPages = Math.ceil(totalItems / slotsPerPage);
  const indexOfLast = currentPage * slotsPerPage;
  const indexOfFirst = indexOfLast - slotsPerPage;
  const currentSlots = slots.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Slot Master</h1>
        <Dialog
          open={openModal}
          onOpenChange={(v) => {
            if (!v) handleReset();
            setOpenModal(v);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-800 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Shift *</Label>
                <Input value={shift} readOnly />
              </div>
              {inputError && (
                <p className="text-sm text-danger">{inputError}</p>
              )}
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button className="bg-blue-800 hover:bg-blue-800 text-white" onClick={handleCreate}>Save Slot</Button>
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
                <TableHead className="text-center  text-white  w-20">S.No.</TableHead>
                <TableHead className="text-center text-white ">Start Time</TableHead>
                <TableHead className="text-center text-white ">End Time</TableHead>
                <TableHead className="text-center text-white ">Shift</TableHead>
                <TableHead className="text-center text-white  w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : currentSlots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground h-[80vh]"
                  >
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    No slots found/Created.
                  </TableCell>
                </TableRow>
              ) : (
                currentSlots.map((slot, index) => (
                  <TableRow key={slot._id}>
                    <TableCell className="text-center">
                      {indexOfFirst + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {slot.startTime}
                    </TableCell>
                    <TableCell className="text-center">
                      {slot.endTime}
                    </TableCell>
                    <TableCell className="text-center">{slot.shift}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="icon"
                        size="sm"
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        onClick={() => {
                          setSlotToDelete(slot.slotNo);
                          setOpenDelete(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              Showing {currentSlots.length} of {totalItems} items
            </div>
            <div className="flex items-center space-x-4">
              <Label className="text-sm">Rows:</Label>
              <Select
                value={slotsPerPage.toString()}
                onValueChange={(value) => {
                  setSlotsPerPage(Number(value));
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
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={openDelete}
        onOpenChange={(v) => {
          setOpenDelete(v);
          if (!v) setSlotToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertCircle className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete this slot? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (slotToDelete) {
                  dispatch(deleteSlot(slotToDelete))
                    .unwrap()
                    .then(() => {
                      toast.success("Slot deleted.");
                      dispatch(fetchAllSlots());
                      setCurrentPage(1);
                    })
                    .catch((err) => {
                      const message = err?.message || "Failed to delete slot.";
                      toast.error(message);
                    })
                    .finally(() => {
                      setOpenDelete(false);
                      setSlotToDelete(null);
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
