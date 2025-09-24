import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Vital } from '../types';

interface VitalsHistoryProps {
  userId?: string;
}

export default function VitalsHistory({ userId }: VitalsHistoryProps) {
  const { user: loggedInUser } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetUserId = userId || loggedInUser?.id;

    const fetchVitals = async () => {
      if (!targetUserId) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('vitals')
          .select('*')
          .eq('user_id', targetUserId)
          .order('recorded_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setVitals(data as Vital[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [user]); // Refetch when user changes

  if (loading) return <p>Loading vitals history...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold mb-4">Recent Vitals</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">SpO2</th>
              <th scope="col" className="px-6 py-3">BP</th>
              <th scope="col" className="px-6 py-3">Heart Rate</th>
              <th scope="col" className="px-6 py-3">Weight</th>
            </tr>
          </thead>
          <tbody>
            {vitals.length > 0 ? vitals.map((vital) => (
              <tr key={vital.id} className="bg-white border-b">
                <td className="px-6 py-4">{new Date(vital.recorded_at).toLocaleString()}</td>
                <td className="px-6 py-4">{vital.spo2 || 'N/A'}%</td>
                <td className="px-6 py-4">{vital.systolic || 'N/A'} / {vital.diastolic || 'N/A'}</td>
                <td className="px-6 py-4">{vital.heart_rate || 'N/A'} bpm</td>
                <td className="px-6 py-4">{vital.weight || 'N/A'} kg</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-4">No vitals recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
