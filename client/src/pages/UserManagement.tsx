import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  SelectChangeEvent,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../config/axios';
import { useUser } from '../contexts/UserContext';

interface UserData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: string;
  department: string;
}

const initialFormData: UserData = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  role: 'creator',
  department: '',
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<UserData[] | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<UserData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/users');
      console.log('Users response:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (user?: UserData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({ ...user, password: '' });
      setEditingId(user.id || null);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
    setError('');
  };

  const handleTextInputChange = (
    field: keyof UserData,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user types
  };

  const handleSelectChange = (
    field: keyof UserData,
    event: SelectChangeEvent
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user selects
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('You must be an admin to perform this action');
      }

      // Validate required fields
      const requiredFields = ['username', 'email', 'fullName', 'role', 'department'];
      if (!editingId) {
        requiredFields.push('password');
      }
      
      const missingFields = requiredFields.filter(field => !formData[field as keyof UserData]);
      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare data for sending
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete dataToSend.password;
      }

      try {
        console.log('Submitting user data:', dataToSend);
        if (editingId) {
          await axios.put(`/api/users/${editingId}`, dataToSend);
          setSnackbar({
            open: true,
            message: 'User updated successfully!',
            severity: 'success'
          });
        } else {
          const response = await axios.post('/api/users', dataToSend);
          console.log('User creation response:', response.data);
          setSnackbar({
            open: true,
            message: 'User created successfully!',
            severity: 'success'
          });
        }

        handleCloseDialog();
        fetchUsers();
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        
        // Handle structured error from axios interceptor
        const errorMessage = apiError.message || 'Failed to save user';
        const errorDetails = apiError.data?.details;

        if (errorDetails) {
          const detailMessages = Object.entries(errorDetails)
            .filter(([_, msg]) => msg !== null)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          setError(detailMessages || errorMessage);
        } else {
          setError(errorMessage);
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });

        // Don't close dialog on error
        return;
      }
    } catch (validationError: any) {
      // Handle client-side validation errors
      const errorMessage = validationError.message || 'Validation failed';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('You must be an admin to delete users');
      }

      await axios.delete(`/api/users/${userId}`);
      setSnackbar({
        open: true,
        message: 'User deleted successfully!',
        severity: 'success'
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error.message || 'An error occurred';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      if (error.status === 401) {
        navigate('/login');
      }
    }
  };

  return (
    <Paper sx={{ p: 3, m: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          disabled={!currentUser || currentUser.role !== 'admin'}
        >
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : users && users.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box p={3} textAlign="center">
            <Typography>No users found</Typography>
          </Box>
        )}
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleTextInputChange('username', e)}
              margin="normal"
              required
              error={!!error}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleTextInputChange('email', e)}
              margin="normal"
              required
              error={!!error}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleTextInputChange('password', e)}
              margin="normal"
              required={!editingId}
              error={!!error}
              helperText={editingId ? 'Leave blank to keep current password' : ''}
            />
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => handleTextInputChange('fullName', e)}
              margin="normal"
              required
              error={!!error}
            />
            <FormControl fullWidth margin="normal" required error={!!error}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleSelectChange('role', e)}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="approver">Approver</MenuItem>
                <MenuItem value="creator">Creator</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => handleTextInputChange('department', e)}
              margin="normal"
              required
              error={!!error}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : editingId ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Paper>
  );
};

export default UserManagement;
