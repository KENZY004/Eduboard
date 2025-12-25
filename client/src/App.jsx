import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Whiteboard from './components/Whiteboard';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import VerificationPending from './pages/VerificationPending';
import AdminPanel from './pages/AdminPanel';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // If admin tries to access dashboard, redirect to admin panel
  if (user.role === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (token) {
    // If user is verified, redirect to dashboard
    if (user.isVerified) {
      // If admin, redirect to admin panel
      if (user.role === 'admin') {
        return <Navigate to="/admin" />;
      }
      return <Navigate to="/dashboard" />;
    }
    // If not verified, redirect to verification pending page
    return <Navigate to="/verification-pending" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-purple-500/30">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/board/:roomId"
              element={
                <PrivateRoute>
                  <Whiteboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/verification-pending"
              element={
                <PrivateRoute>
                  <VerificationPending />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
