import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useBeneficiaries, Beneficiary, BankDetails } from '../contexts/BeneficiaryContext';

interface FormData {
  name: string;
  email: string;
  type: 'Individual' | 'Company';
  address: string;
  contactNumber: string;
  bankDetails: BankDetails;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  type: 'Individual',
  address: '',
  contactNumber: '',
  bankDetails: {
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  }
};

const BeneficiaryManagement: React.FC = () => {
  const { beneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  const [open, setOpen] = useState(false);
  const [editBeneficiary, setEditBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleClickOpen = (beneficiary?: Beneficiary) => {
    if (beneficiary) {
      setEditBeneficiary(beneficiary);
      setFormData({
        name: beneficiary.name,
        email: beneficiary.email,
        type: beneficiary.type,
        address: beneficiary.address,
        contactNumber: beneficiary.contactNumber,
        bankDetails: {
          bankName: beneficiary.bankDetails.bankName,
          accountNumber: beneficiary.bankDetails.accountNumber,
          ifscCode: beneficiary.bankDetails.ifscCode
        }
      });
    } else {
      setEditBeneficiary(null);
      setFormData(initialFormData);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditBeneficiary(null);
    setFormData(initialFormData);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.address || !formData.contactNumber ||
        !formData.bankDetails.bankName || !formData.bankDetails.accountNumber || 
        !formData.bankDetails.ifscCode) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    if (editBeneficiary) {
      updateBeneficiary({
        id: editBeneficiary.id,
        ...formData
      });
      setSnackbar({
        open: true,
        message: 'Beneficiary updated successfully',
        severity: 'success'
      });
    } else {
      addBeneficiary(formData);
      setSnackbar({
        open: true,
        message: 'Beneficiary added successfully',
        severity: 'success'
      });
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    deleteBeneficiary(id);
    setSnackbar({
      open: true,
      message: 'Beneficiary deleted successfully',
      severity: 'success'
    });
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Beneficiary Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleClickOpen()}
          sx={{ mb: 2 }}
        >
          Add New Beneficiary
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Bank Details</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  <TableCell>{beneficiary.name}</TableCell>
                  <TableCell>{beneficiary.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={beneficiary.type}
                      color={beneficiary.type === 'Individual' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{beneficiary.contactNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {beneficiary.bankDetails.bankName} - {beneficiary.bankDetails.accountNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleClickOpen(beneficiary)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(beneficiary.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Individual' | 'Company' })}
                required
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Company">Company</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Bank Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, ifscCode: e.target.value }
                })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.email || !formData.address || !formData.contactNumber ||
                     !formData.bankDetails.bankName || !formData.bankDetails.accountNumber || 
                     !formData.bankDetails.ifscCode}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </>
  );
};

export default BeneficiaryManagement;
