import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

type Page = 'dashboard' | 'profile';

import Spinner from './components/Spinner';

function AppContent() {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigateToProfile = () => setCurrentPage('profile');
  const navigateToDashboard = () => setCurrentPage('dashboard');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  // If session exists, show the appropriate page
  if (currentPage === 'dashboard') {
    return <DashboardPage navigateToProfile={navigateToProfile} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage navigateToDashboard={navigateToDashboard} />;
  }

  // Fallback to dashboard
  return <DashboardPage navigateToProfile={navigateToProfile} />;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
