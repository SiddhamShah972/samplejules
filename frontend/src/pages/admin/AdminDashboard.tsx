import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile } from '../../types';
import PatientDetailPage from './PatientDetailPage';

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'patient');

        if (error) throw error;
        setPatients(data as Profile[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (selectedPatient) {
    return <PatientDetailPage patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Patient List</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Age</th>
              <th scope="col" className="px-6 py-3">Gender</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? patients.map((patient) => (
              <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{patient.full_name || 'N/A'}</td>
                <td className="px-6 py-4">{patient.age || 'N/A'}</td>
                <td className="px-6 py-4">{patient.gender || 'N/A'}</td>
                <td className="px-6 py-4">
                  {/* Placeholder for priority coloring */}
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Normal
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-4">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
