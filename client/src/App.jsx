import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Whiteboard from './components/Whiteboard';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import VerificationPending from './pages/VerificationPending';
import AdminPanel from './pages/AdminPanel';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import VerifyRegistrationOTP from './pages/VerifyRegistrationOTP';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';

// --- Route Protection Guards ---
import Navbar from "./components/Navbar";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Whiteboard from "./components/Whiteboard";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";
import VerificationPending from "./pages/VerificationPending";
import AdminPanel from "./pages/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import VerifyRegistrationOTP from "./pages/VerifyRegistrationOTP";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./context/ThemeContext";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (user.role === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token) {
    if (user.isVerified) {
      if (user.role === 'admin') {
        return <Navigate to="/admin" />;
      }
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to="/verification-pending" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// --- Main Layout Wrapper ---
const AppLayout = () => {
  const location = useLocation();
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/verify-email",
  ];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-purple-500/30">
      <Navbar />
      <div className={isAuthRoute ? "" : "pt-14"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <VerifyOTP />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyRegistrationOTP />
              </PublicRoute>
            }
          />

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

          <Route path="*" element={<NotFound />} />

          
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;