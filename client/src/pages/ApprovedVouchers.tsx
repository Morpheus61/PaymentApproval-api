import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  styled,
} from '@mui/material';
import {
  Print as PrintIcon,
  GetApp as ExportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ApprovedVoucher {
  id: string;
  payeeName: string;
  amount: number;
  category: string;
  submittedDate: string;
  approvedDate: string;
  approvedBy: string;
  status: string;
  description?: string;
  paymentMethod?: string;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
}));

const ApprovedVouchers: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<ApprovedVoucher | null>(null);

  // TODO: Replace with API call
  const mockVouchers: ApprovedVoucher[] = [
    {
      id: '1',
      payeeName: 'John Doe',
      amount: 500,
      category: 'Office Supplies',
      submittedDate: '2023-11-25',
      approvedDate: '2023-11-26',
      approvedBy: 'Admin User',
      status: 'Approved',
      description: 'Office stationery and supplies',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '2',
      payeeName: 'Jane Smith',
      amount: 1200,
      category: 'Travel',
      submittedDate: '2023-11-24',
      approvedDate: '2023-11-25',
      approvedBy: 'Manager User',
      status: 'Approved',
      description: 'Business trip expenses',
      paymentMethod: 'Credit Card',
    },
  ];

  const filteredVouchers = mockVouchers.filter((voucher) => {
    return voucher.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           voucher.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExport = () => {
    const csvContent = [
      ['Voucher ID', 'Payee Name', 'Amount', 'Category', 'Submitted Date', 'Approved Date', 'Approved By', 'Status'],
      ...filteredVouchers.map(v => [
        v.id,
        v.payeeName,
        v.amount,
        v.category,
        v.submittedDate,
        v.approvedDate,
        v.approvedBy,
        v.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approved-vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Relish Foods Pvt Ltd - Payment Voucher</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .voucher-details { margin: 20px 0; }
            .row { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Relish Foods Pvt Ltd</h2>
            <h3>Payment Voucher</h3>
          </div>
          <div class="voucher-details">
            <div class="row">
              <span class="label">Voucher ID:</span> ${selectedVoucher?.id}
            </div>
            <div class="row">
              <span class="label">Payee Name:</span> ${selectedVoucher?.payeeName}
            </div>
            <div class="row">
              <span class="label">Amount:</span> ₹${selectedVoucher?.amount}
            </div>
            <div class="row">
              <span class="label">Category:</span> ${selectedVoucher?.category}
            </div>
            <div class="row">
              <span class="label">Payment Method:</span> ${selectedVoucher?.paymentMethod}
            </div>
            <div class="row">
              <span class="label">Status:</span> ${selectedVoucher?.status}
            </div>
            <div class="row">
              <span class="label">Submitted Date:</span> ${selectedVoucher?.submittedDate}
            </div>
            <div class="row">
              <span class="label">Approved Date:</span> ${selectedVoucher?.approvedDate || '-'}
            </div>
            <div class="row">
              <span class="label">Description:</span> ${selectedVoucher?.description}
            </div>
            <div class="row">
              <span class="label">Approved By:</span> ${selectedVoucher?.approvedBy || '-'}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Approved Vouchers
        </Typography>
        <Box>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search by ID or Payee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Voucher ID</TableCell>
              <TableCell>Payee Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Approved Date</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVouchers.map((voucher) => (
              <StyledTableRow 
                key={voucher.id}
                onClick={() => setSelectedVoucher(voucher)}
              >
                <TableCell>{voucher.id}</TableCell>
                <TableCell>{voucher.payeeName}</TableCell>
                <TableCell>₹{voucher.amount}</TableCell>
                <TableCell>{voucher.category}</TableCell>
                <TableCell>{voucher.submittedDate}</TableCell>
                <TableCell>{voucher.approvedDate}</TableCell>
                <TableCell>{voucher.approvedBy}</TableCell>
                <TableCell>
                  <Chip
                    label={voucher.status}
                    color="success"
                    size="small"
                  />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={Boolean(selectedVoucher)} 
        onClose={() => setSelectedVoucher(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedVoucher && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Voucher Details</Typography>
              <IconButton onClick={() => setSelectedVoucher(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Voucher ID</Typography>
                  <Typography>{selectedVoucher.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Payee Name</Typography>
                  <Typography>{selectedVoucher.payeeName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography>₹{selectedVoucher.amount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography>{selectedVoucher.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                  <Typography>{selectedVoucher.paymentMethod}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedVoucher.status} color="success" size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                  <Typography>{selectedVoucher.submittedDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Approved Date</Typography>
                  <Typography>{selectedVoucher.approvedDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography>{selectedVoucher.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                  <Typography>{selectedVoucher.approvedBy}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedVoucher(null)}>Close</Button>
              <Button startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default ApprovedVouchers;
