import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { AIAssistantDrawer } from './features/ai/AIAssistantDrawer';
import { BookingCheckoutModal } from './features/booking/BookingCheckoutModal';

// Pages
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

export const App = () => {
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingConfig, setBookingConfig] = useState(null);

  const handleOpenAiDrawer = () => setIsAiDrawerOpen(true);

  const handleSelectBookingConfig = (config) => {
    setBookingConfig(config);
    setIsCheckoutOpen(true);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {/* Main Navigation Header */}
          <Navbar onOpenAiDrawer={handleOpenAiDrawer} />

          {/* Main Application Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              {/* ── Customer ── */}
              <Route
                path="/"
                element={
                  <HomePage
                    onOpenAiDrawer={handleOpenAiDrawer}
                    onSelectBookingConfig={handleSelectBookingConfig}
                  />
                }
              />
              <Route
                path="/services"
                element={<ServicesPage onSelectBookingConfig={handleSelectBookingConfig} />}
              />
              <Route
                path="/workers"
                element={<WorkerDiscoveryPage onSelectBookingConfig={handleSelectBookingConfig} />}
              />
              {/* Worker Profile Page (/workers/:id) */}
              <Route
                path="/workers/:id"
                element={<WorkerProfilePage onSelectBookingConfig={handleSelectBookingConfig} />}
              />
              <Route path="/bookings" element={<BookingsListPage />} />
              <Route path="/bookings/:id" element={<BookingTrackingPage />} />

              {/* Customer Dashboard (/profile) */}
              <Route
                path="/profile"
                element={
                  <CustomerDashboardPage
                    onSelectBookingConfig={handleSelectBookingConfig}
                    onOpenAiDrawer={handleOpenAiDrawer}
                  />
                }
              />

              {/* ── Worker ── */}
              <Route path="/worker-dashboard" element={<WorkerDashboardPage />} />
              {/* Worker Welfare Page (/worker/welfare) */}
              <Route path="/worker/welfare" element={<WorkerWelfarePage />} />

              {/* ── Admin ── */}
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Mobile Bottom Navigation */}
          <BottomNav onOpenAiDrawer={handleOpenAiDrawer} />

          {/* Global AI Assistant Drawer */}
          <AIAssistantDrawer
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            onSelectWorkerForBooking={handleSelectBookingConfig}
          />

          {/* Global Booking Checkout Modal */}
          <BookingCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            bookingConfig={bookingConfig}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
