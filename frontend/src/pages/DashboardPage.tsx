import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import VitalsForm from '../components/VitalsForm';
import SymptomLogger from '../components/SymptomLogger';
import VitalsHistory from '../components/VitalsHistory';
import SymptomsHistory from '../components/SymptomsHistory';
import AdminDashboard from './admin/AdminDashboard';

interface DashboardPageProps {
  navigateToProfile: () => void;
}

export default function DashboardPage({ navigateToProfile }: DashboardPageProps) {
  const { user, profile, logout } = useAuth();
  const [dataVersion, setDataVersion] = useState(0);

  const handleDataUpdate = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  const isAdmin = profile?.role === 'admin';

  // Admin View
  if (isAdmin) {
    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Smart Patient Monitoring</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {profile?.full_name || user?.email} (Admin)</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <AdminDashboard />
        </div>
    );
  }

  // Patient Dashboard
  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {profile?.full_name || user?.email}</span>
          <button
            onClick={navigateToProfile}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            My Profile
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <VitalsHistory key={`vitals-${dataVersion}`} />
            <SymptomsHistory key={`symptoms-${dataVersion}`} />
        </div>
        <div className="lg:col-span-1 space-y-8">
            <VitalsForm onNewVital={handleDataUpdate} />
            <SymptomLogger onNewSymptom={handleDataUpdate} />
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Vitals Chart</h3>
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
                    <p className="text-gray-500">Charting library not installed. Chart will be displayed here.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
