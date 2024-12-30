import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePDF(element: HTMLElement, voucherNumber: string) {
  try {
    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add content
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`Relish-Foods-Voucher-${voucherNumber}.pdf`);
    console.log(`[${new Date().toISOString()}] PDF generated successfully.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating PDF:`, error);
    alert('Error generating PDF. Please try again.');
  }
}

export function printVoucher(element: HTMLElement) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Voucher</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            @media print {
              @page { 
                size: A4;
                margin: 20mm;
              }
            }
            .print-content {
              max-width: 800px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${element.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}