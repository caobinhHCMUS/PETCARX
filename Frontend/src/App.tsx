import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import MyPets from './pages/customer/MyPets';
import Booking from './pages/customer/Booking';
import History from './pages/customer/History';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import AppointmentList from './pages/doctor/Appointments';
import CreateRecord from './pages/doctor/Records';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RevenueReport from './pages/admin/Revenue';
import type { UserRole } from './types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Login />
      } />

      <Route path="/register" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Register />
      } />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="booking" element={<Booking />} />
        <Route path="history" element={<History />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="records" element={<CreateRecord />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="revenue" element={<RevenueReport />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
