import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const DownloadMom = ({ pdfUrl, title }) => {
  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `meeting-minute-${title || 'mom'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleDownloadPdf}
      className="hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
      title="Download"
      disabled={!pdfUrl}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default DownloadMom;