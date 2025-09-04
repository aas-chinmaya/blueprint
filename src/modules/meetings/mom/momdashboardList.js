


"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMoMs,
  resetMoMByMeetingId,
} from "@/features/momSlice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MomDashboardList() {
  const dispatch = useDispatch();
  const { mom, momLoading, momError } = useSelector(
    (state) => state.mom
  );

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);

  useEffect(() => {
    dispatch(fetchMoMs());
  }, [dispatch]);

  const handleViewPDF = (pdfUrl) => {
    setSelectedPDFUrl(pdfUrl);
    setPdfDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meeting MoMs</h1>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <TableRow>
                <TableHead className="text-center text-white">S.No</TableHead>
                <TableHead className="text-center text-white">MoM ID</TableHead>
                <TableHead className="text-center text-white">Created By</TableHead>
                <TableHead className="text-center text-white">Date</TableHead>
                <TableHead className="text-center text-white">Time</TableHead>
                <TableHead className="text-center text-white">Duration</TableHead>
                <TableHead className="text-center text-white">Mode</TableHead>
                <TableHead className="text-center text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {momLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : momError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-danger">
                   MOM Not Found 
                  </TableCell>
                </TableRow>
              ) : mom.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No MoMs found.
                  </TableCell>
                </TableRow>
              ) : (
                mom.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-center">{item.momId}</TableCell>
                    <TableCell className="text-center">{item.createdBy}</TableCell>
                    <TableCell className="text-center">{item.date}</TableCell>
                    <TableCell className="text-center">{item.time}</TableCell>
                    <TableCell className="text-center">{item.duration}</TableCell>
                    <TableCell className="text-center">{item.meetingMode}</TableCell>
                    <TableCell className="text-center">
                      {item.pdfUrl && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                className="cursor-pointer text-blue-700"
                                variant="icon"
                                onClick={() => handleViewPDF(item.pdfUrl)}
                              >
                                <Eye className="h-4 w-4 " /> 
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View PDF</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <Dialog
        open={pdfDialogOpen}
        onOpenChange={(open) => {
          setPdfDialogOpen(open);
          if (!open) {
            setSelectedPDFUrl(null);
            dispatch(resetMoMByMeetingId());
          }
        }}
      >
      
        <DialogContent className="w-full max-w-5xl h-[90vh] flex flex-col">
  <DialogHeader>
    <DialogTitle className="text-blue-800">MoM PDF Preview</DialogTitle>
  </DialogHeader>

  

  <div className="flex-1 overflow-hidden">
    {selectedPDFUrl ? (
      <iframe
        src={selectedPDFUrl}
        className="w-full h-full rounded-md border"
        title="MoM PDF"
        
      />
    ) : (
      <p className="text-muted-foreground text-center py-10">Loading PDF...</p>
    )}
  </div>
  
</DialogContent>

      </Dialog>
    </div>
  );
}
