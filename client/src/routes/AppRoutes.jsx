import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Loader from '../components/common/Loader';

// Pages are lazy-loaded so admins, trainers and members only download the screens they use.
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const MembersPage = lazy(() => import('../pages/admin/MembersPage'));
const TrainersPage = lazy(() => import('../pages/admin/TrainersPage'));
const MembershipPlansPage = lazy(() => import('../pages/admin/MembershipPlansPage'));
const AttendancePage = lazy(() => import('../pages/admin/AttendancePage'));
const PaymentsPage = lazy(() => import('../pages/admin/PaymentsPage'));
const WorkoutsPage = lazy(() => import('../pages/admin/WorkoutsPage'));
const ProgressPage = lazy(() => import('../pages/admin/ProgressPage'));
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage'));
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));

const TrainerDashboard = lazy(() => import('../pages/trainer/TrainerDashboard'));

const MemberDashboard = lazy(() => import('../pages/member/MemberDashboard'));
const MemberAttendancePage = lazy(() => import('../pages/member/MemberAttendancePage'));
const MemberWorkoutPage = lazy(() => import('../pages/member/MemberWorkoutPage'));
const MemberProgressPage = lazy(() => import('../pages/member/MemberProgressPage'));
const MemberPaymentsPage = lazy(() => import('../pages/member/MemberPaymentsPage'));

const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <Loader message="Validating credentials..." />;
  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's home dashboard if unauthorized
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />;
    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
};

// Root index redirector
const RootRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return <Loader message="Initializing TitanPulse..." />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />;
  return <Navigate to="/member/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader message="Loading..." />}>
    <Routes>
      {/* Auth Public Route */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Main Protected Application */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TrainersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MembershipPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workouts"
          element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/progress"
          element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Trainer Routes */}
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/members"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/workouts"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/progress"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/attendance"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/attendance"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/workout"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberWorkoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/progress"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/payments"
          element={
            <ProtectedRoute allowedRoles={['member', 'admin']}>
              <MemberPaymentsPage />
            </ProtectedRoute>
          }
        />

        {/* Common Profile */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
