import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { UserProvider } from './contexts/UserContext';
import { BeneficiaryProvider } from './contexts/BeneficiaryContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import NewVoucher from './pages/NewVoucher';
import UserManagement from './pages/UserManagement';
import BeneficiaryManagement from './pages/BeneficiaryManagement';
import Dashboard from './pages/Dashboard';
import PendingApprovals from './pages/PendingApprovals';
import ApprovedVouchers from './pages/ApprovedVouchers';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import MyVouchers from './pages/MyVouchers';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <BeneficiaryProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              <Route path="/" element={<Layout />}>
                {/* Admin Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beneficiary-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <BeneficiaryManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Approver Routes */}
                <Route
                  path="/pending-approvals"
                  element={
                    <ProtectedRoute requiredRole="approver">
                      <PendingApprovals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approved-vouchers"
                  element={
                    <ProtectedRoute requiredRole="approver">
                      <ApprovedVouchers />
                    </ProtectedRoute>
                  }
                />

                {/* Creator Routes */}
                <Route
                  path="/new-voucher"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <NewVoucher />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-vouchers"
                  element={
                    <ProtectedRoute requiredRole="creator">
                      <MyVouchers />
                    </ProtectedRoute>
                  }
                />

                {/* Default route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Router>
        </BeneficiaryProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
