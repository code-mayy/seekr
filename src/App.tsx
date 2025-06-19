import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthProvider';
import { Web3Provider } from '@/components/Web3Provider';
import { Hero } from '@/components/Hero';
import { Reviews } from '@/components/Reviews';
import { Auth } from '@/components/Auth';
import { Footer } from '@/components/Footer';
import { Homepage } from '@/components/Homepage';
import { UserProfile } from '@/components/UserProfile';
import { Navigation } from '@/components/Navigation';
import { PricingPage } from '@/components/PricingPage';
import { EscrowPage } from '@/components/EscrowPage';
import { ListRequestForm } from '@/components/ListRequestForm';
import { SplashedPushNotifications } from '@/components/ui/splashed-push-notifications';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

function AppContent() {
  const { user, loading } = useAuth();
  const { notificationRef } = useNotifications();
  const [currentView, setCurrentView] = useState<'homepage' | 'profile' | 'pricing' | 'escrow'>('homepage');
  const [showListForm, setShowListForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen">
        <Hero />
        <Reviews />
        <Auth />
        <Footer />
        <SplashedPushNotifications
          ref={notificationRef}
          timerColor="rgba(255,255,255,0.9)"
          timerBgColor="rgba(255,255,255,0.3)"
        />
      </div>
    );
  }

  // Show authenticated user interface
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateListing={() => setShowListForm(true)}
      />
      
      {currentView === 'homepage' && <Homepage />}
      {currentView === 'profile' && <UserProfile />}
      {currentView === 'pricing' && <PricingPage onBack={() => setCurrentView('homepage')} />}
      {currentView === 'escrow' && <EscrowPage onBack={() => setCurrentView('homepage')} />}
      
      <ListRequestForm
        isOpen={showListForm}
        onClose={() => setShowListForm(false)}
      />

      <SplashedPushNotifications
        ref={notificationRef}
        timerColor="rgba(255,255,255,0.9)"
        timerBgColor="rgba(255,255,255,0.3)"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;