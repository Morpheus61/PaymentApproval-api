import { Button } from '@/components/ui/button';
import { PrinterIcon, Download } from 'lucide-react';
import { useState } from 'react';
import { generatePDF, printVoucher } from '@/lib/pdf';

interface VoucherActionsProps {
  contentRef: string;
  voucherNumber: string;
}

export function VoucherActions({ contentRef, voucherNumber }: VoucherActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePrint = () => {
    const element = document.getElementById(contentRef);
    if (element) {
      printVoucher(element);
    }
    setShowDropdown(false);
  };

  const handleSaveAsPDF = async () => {
    const element = document.getElementById(contentRef);
    if (element) {
      await generatePDF(element, voucherNumber);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2"
      >
        <PrinterIcon className="h-4 w-4" />
        <span>Print/Save</span>
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleSaveAsPDF}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}