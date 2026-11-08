import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MainProductSection } from './components/MainProductSection';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StickyMobileOrderBar } from './components/StickyMobileOrderBar';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { LightboxModal } from './components/LightboxModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginPage } from './components/Admin/AdminLoginPage';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, navigate, isAdminAuthenticated, isAuthLoading, isAdminOpen } = useStore();

  // If loading auth state while on admin routes, show branded loader
  if (isAuthLoading && (currentRoute.startsWith('/admin'))) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4 text-stone-900">
        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-serif font-bold text-lg shadow-lg">
          JM
        </div>
        <div className="flex items-center space-x-2 text-stone-600 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-stone-800" />
          <span>নিরাপদ সেশন যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // Dedicated Admin Login Route
  if (currentRoute === '/admin/login') {
    return (
      <AdminLoginPage
        onNavigateToStore={() => navigate('/')}
        onLoginSuccess={() => navigate('/admin')}
      />
    );
  }

  // Dedicated Admin Dashboard Route (/admin or /admin/dashboard)
  if (currentRoute === '/admin' || currentRoute === '/admin/dashboard') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginPage
          onNavigateToStore={() => navigate('/')}
          onLoginSuccess={() => navigate('/admin')}
        />
      );
    }
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <AdminDashboard />
      </div>
    );
  }

  // Customer-Facing Storefront Route (/)
  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#1A1A1A] font-sans selection:bg-[#E6004C] selection:text-white">
      {/* Navigation Bar */}
      <Header />

      {/* Hero Banner Section */}
      <Hero />

      {/* Main Product Showcase & Color Variant Customizer */}
      <MainProductSection />

      {/* Customer Reviews & Star Ratings */}
      <CustomerReviews />

      {/* Footer */}
      <Footer />

      {/* Sticky Mobile CTA Bar */}
      <StickyMobileOrderBar />

      {/* Floating WhatsApp Support Button */}
      <WhatsAppFloatingButton />

      {/* Modals & Drawers */}
      <OrderFormModal />
      <OrderSuccessModal />
      <LightboxModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

