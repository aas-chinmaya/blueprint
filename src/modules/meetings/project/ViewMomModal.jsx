
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, Hash } from 'lucide-react';
import DownloadMom from './DownloadMom';

const ViewMomModal = ({ open, onOpenChange, meetingMomView, meetingMomViewLoading, status }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="
          w-[100vw] sm:w-[95vw] lg:w-[85vw] 
          h-[95vh] 
          max-w-6xl
          bg-white rounded-2xl shadow-2xl 
          flex flex-col overflow-hidden
        "
      >
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            
            {/* Title + MOM ID */}
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                Minutes of Meeting
              </DialogTitle>
              {meetingMomView?.momId && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span>MOM ID: {meetingMomView.momId}</span>
                </div>
              )}
            </div>

            {/* Download Button */}
            {status === 'final' && (
              <DownloadMom 
                pdfUrl={meetingMomView?.pdfUrl} 
                title={meetingMomView?.title} 
              />
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          {meetingMomViewLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-base text-gray-700">Loading Meeting Minutes...</p>
            </div>
          ) : meetingMomView?.pdfUrl ? (
            <iframe
              src={meetingMomView.pdfUrl}
              title="Meeting Minute PDF"
              className="w-full h-full border-0"
            />
          ) : (
            <p className="text-gray-600 text-base">No Meeting Minutes PDF available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMomModal;
