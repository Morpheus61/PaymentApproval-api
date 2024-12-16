import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box
} from '@mui/material';
import axios from '../config/axios';

interface Voucher {
  _id: string;
  payeeName: string;
  amount: number;
  category: string;
  submittedBy: {
    _id: string;
    username: string;
    fullName: string;
    department: string;
  };
  department: string;
  status: string;
  description: string;
  createdAt: string;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      fullName: string;
    };
    text: string;
    createdAt: string;
  }>;
}

interface DialogState {
  open: boolean;
  voucherId: string | null;
  action: 'approve' | 'reject' | null;
}

const PendingApprovals: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    voucherId: null,
    action: null
  });
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchPendingVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/vouchers/pending');
      console.log('Pending vouchers:', response.data);
      setVouchers(response.data);
    } catch (error: any) {
      console.error('Error fetching pending vouchers:', error);
      setError('Failed to fetch pending vouchers');
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch pending vouchers',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVouchers();
  }, []);

  const handleActionClick = (voucherId: string, action: 'approve' | 'reject') => {
    setDialog({
      open: true,
      voucherId,
      action
    });
    setComment('');
  };

  const handleDialogClose = () => {
    setDialog({
      open: false,
      voucherId: null,
      action: null
    });
    setComment('');
  };

  const handleActionConfirm = async () => {
    if (!dialog.voucherId || !dialog.action) return;

    try {
      await axios.put(`/api/vouchers/${dialog.voucherId}/status`, {
        status: dialog.action === 'approve' ? 'Approved' : 'Rejected',
        comment: comment.trim() || `Voucher ${dialog.action}d`
      });

      setSnackbar({
        open: true,
        message: `Voucher ${dialog.action}d successfully`,
        severity: 'success'
      });

      handleDialogClose();
      fetchPendingVouchers();
    } catch (error: any) {
      console.error(`Error ${dialog.action}ing voucher:`, error);
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${dialog.action} voucher`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pending Approvals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payee Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher._id}>
                <TableCell>{voucher.payeeName}</TableCell>
                <TableCell>${voucher.amount.toFixed(2)}</TableCell>
                <TableCell>{voucher.category}</TableCell>
                <TableCell>{voucher.submittedBy.fullName}</TableCell>
                <TableCell>{voucher.department}</TableCell>
                <TableCell>
                  <Chip
                    label={voucher.status}
                    color="warning"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleActionClick(voucher._id, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleActionClick(voucher._id, 'reject')}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No pending vouchers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialog.open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.action === 'approve' ? 'Approve' : 'Reject'} Voucher
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment (Optional)"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleActionConfirm}
            color={dialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {dialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PendingApprovals;
