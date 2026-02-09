import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Profile from './pages/Profile';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MakePayment from './pages/user/MakePayment';
import CheckBalance from './pages/user/CheckBalance';
import SpamRequests from './pages/user/SpamRequests';
import ActivityHistory from './pages/user/ActivityHistory';
import Notifications from './pages/user/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import APITraffic from './pages/admin/APITraffic';
import SuspiciousActivity from './pages/admin/SuspiciousActivity';
import RiskSecurityEngine from './pages/admin/RiskSecurityEngine';
import BehavioralAnomalies from './pages/admin/BehavioralAnomalies';
import PolicySimulation from './pages/PolicySimulation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/payment"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <MakePayment />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/balance"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <CheckBalance />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/spam"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <SpamRequests />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/activity"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <ActivityHistory />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/notifications"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <Notifications />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <UserLayout>
                  <Profile />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/traffic"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <APITraffic />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suspicious"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <SuspiciousActivity />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/risk-analysis"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RiskSecurityEngine />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/behavioral-anomalies"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <BehavioralAnomalies />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policy-simulation"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <PolicySimulation />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
