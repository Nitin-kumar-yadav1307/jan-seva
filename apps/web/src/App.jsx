import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/GeolocationContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { AIAssistantDrawer } from './features/ai/AIAssistantDrawer';
import { BookingCheckoutModal } from './features/booking/BookingCheckoutModal';

// Pages
import { AuthPage } from './features/auth/AuthPage';
import { HomePage } from './features/home/HomePage';
import { ServicesPage } from './features/services/ServicesPage';
import { WorkerDiscoveryPage } from './features/workers/WorkerDiscoveryPage';
import { WorkerProfilePage } from './features/workers/WorkerProfilePage';
import { BookingsListPage } from './features/booking/BookingsListPage';
import { BookingTrackingPage } from './features/booking/BookingTrackingPage';
import { CustomerDashboardPage } from './features/customer/CustomerDashboardPage';
import { WorkerDashboardPage } from './features/worker/WorkerDashboardPage';
import { WorkerWelfarePage } from './features/worker/WorkerWelfarePage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, sessionReady } = useAuth();

  if (!sessionReady) return <div className="min-h-[40vh]" aria-label="Checking session" />;

  if (!user) return <Navigate to="/auth" replace />;

  const role = String(user.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'FEDERATION_ADMIN';
  if (requiredRole && role !== requiredRole && !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === 'CUSTOMER' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RedirectLegacyCustomerRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={id ? `/customer/workers/${id}` : '/customer/workers'} replace />;
};

const RedirectLegacyBookingRoute = () => {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={id ? `/customer/bookings/${id}` : '/customer/bookings'} replace />;
};

const AppShell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingConfig, setBookingConfig] = useState(null);

  const handleOpenAiDrawer = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsAiDrawerOpen(true);
  };

  const handleSelectBookingConfig = (config) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setBookingConfig(config);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Navbar onOpenAiDrawer={handleOpenAiDrawer} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<HomePage onOpenAiDrawer={handleOpenAiDrawer} onSelectBookingConfig={handleSelectBookingConfig} />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/customer/dashboard" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerDashboardPage onSelectBookingConfig={handleSelectBookingConfig} onOpenAiDrawer={handleOpenAiDrawer} /></ProtectedRoute>} />
          <Route path="/customer/services" element={<ProtectedRoute requiredRole="CUSTOMER"><ServicesPage onSelectBookingConfig={handleSelectBookingConfig} /></ProtectedRoute>} />
          <Route path="/customer/workers" element={<ProtectedRoute requiredRole="CUSTOMER"><WorkerDiscoveryPage onSelectBookingConfig={handleSelectBookingConfig} /></ProtectedRoute>} />
          <Route path="/customer/workers/:id" element={<ProtectedRoute requiredRole="CUSTOMER"><WorkerProfilePage onSelectBookingConfig={handleSelectBookingConfig} /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute requiredRole="CUSTOMER"><BookingsListPage /></ProtectedRoute>} />
          <Route path="/customer/bookings/:id" element={<ProtectedRoute requiredRole="CUSTOMER"><BookingTrackingPage /></ProtectedRoute>} />

          <Route path="/worker/dashboard" element={<ProtectedRoute requiredRole="WORKER"><WorkerDashboardPage /></ProtectedRoute>} />
          <Route path="/worker/welfare" element={<ProtectedRoute requiredRole="WORKER"><WorkerWelfarePage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />

          <Route path="/services" element={<Navigate to={user ? '/customer/services' : '/auth'} replace />} />
          <Route path="/workers" element={<Navigate to={user ? '/customer/workers' : '/auth'} replace />} />
          <Route path="/workers/:id" element={<RedirectLegacyCustomerRoute />} />
          <Route path="/bookings" element={<Navigate to={user ? '/customer/bookings' : '/auth'} replace />} />
          <Route path="/bookings/:id" element={<RedirectLegacyBookingRoute />} />
          <Route path="/profile" element={<Navigate to={user ? '/customer/dashboard' : '/auth'} replace />} />
          <Route path="/worker-dashboard" element={<Navigate to={user ? '/worker/dashboard' : '/auth'} replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <BottomNav onOpenAiDrawer={handleOpenAiDrawer} />

      <AIAssistantDrawer isOpen={isAiDrawerOpen} onClose={() => setIsAiDrawerOpen(false)} onSelectWorkerForBooking={handleSelectBookingConfig} />
      <BookingCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} bookingConfig={bookingConfig} />
    </div>
  );
};

export const App = () => (
  <AuthProvider>
    <LocationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
      </BrowserRouter>
    </LocationProvider>
  </AuthProvider>
);

export default App;
