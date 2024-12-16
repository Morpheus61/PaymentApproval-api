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
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from '../config/axios';

interface Voucher {
  _id: string;
  payeeName: string;
  amount: number;
  category: string;
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

const MyVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/vouchers/my-vouchers');
      console.log('My vouchers:', response.data);
      setVouchers(response.data);
    } catch (error: any) {
      console.error('Error fetching my vouchers:', error);
      setError(error.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVouchers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
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
        My Vouchers
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
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher._id}>
                <TableCell>{voucher.payeeName}</TableCell>
                <TableCell>${voucher.amount.toFixed(2)}</TableCell>
                <TableCell>{voucher.category}</TableCell>
                <TableCell>{voucher.department}</TableCell>
                <TableCell>
                  <Chip
                    label={voucher.status}
                    color={getStatusColor(voucher.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(voucher.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="primary"
                      // TODO: Add view details functionality
                      onClick={() => console.log('View details:', voucher._id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No vouchers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MyVouchers;
