import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import { useUser } from '../contexts/UserContext';

const NewVoucher: React.FC = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    payeeName: '',
    amount: '',
    category: '',
    description: '',
    paymentMethod: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const categories = [
    'Office Supplies',
    'Travel',
    'Utilities',
    'Maintenance',
    'Others'
  ];

  const paymentMethods = [
    'Bank Transfer',
    'Cash',
    'Check'
  ];

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.payeeName || !formData.amount || !formData.category || !formData.paymentMethod) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      // Here you would typically send the data to your backend
      const voucherData = {
        ...formData,
        submittedBy: user?.username,
        submittedDate: new Date().toISOString(),
        status: 'Pending',
      };

      console.log('Submitting voucher:', voucherData);
      
      setSnackbar({
        open: true,
        message: 'Voucher submitted successfully',
        severity: 'success'
      });

      // Clear form
      setFormData({
        payeeName: '',
        amount: '',
        category: '',
        description: '',
        paymentMethod: '',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error submitting voucher',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Voucher
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Payee Name"
                value={formData.payeeName}
                onChange={handleChange('payeeName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleChange('amount')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleChange('paymentMethod')}
              >
                {paymentMethods.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit Voucher
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewVoucher;
