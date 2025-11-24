import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import QRScannerStudent from './components/student/QRScannerStudent';
import AttendanceHistory from './components/student/AttendanceHistory';

// Faculty Components
import FacultyDashboard from './components/faculty/FacultyDashboard';
import ClassSession from './components/faculty/ClassSession';
import Sessions from './pages/faculty/Sessions';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Old components (keeping for backward compatibility)
import Timetable from './components/Timetable';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root redirect based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/scan"
              element={
                <ProtectedRoute>
                  <QRScannerStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/sessions"
              element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/session/:sessionId"
              element={
                <ProtectedRoute>
                  <ClassSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/reports"
              element={
                <ProtectedRoute>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Backward compatibility routes */}
            <Route path="/scan" element={<Navigate to="/student/scan" replace />} />
            <Route path="/attendance" element={<Navigate to="/student/attendance" replace />} />
            <Route path="/timetable" element={<Navigate to="/student/timetable" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
