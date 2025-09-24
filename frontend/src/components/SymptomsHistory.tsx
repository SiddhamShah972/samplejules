import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Symptom } from '../types';

interface SymptomsHistoryProps {
  userId?: string;
}

export default function SymptomsHistory({ userId }: SymptomsHistoryProps) {
  const { user: loggedInUser } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetUserId = userId || loggedInUser?.id;

    const fetchSymptoms = async () => {
      if (!targetUserId) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('symptoms')
          .select('*')
          .eq('user_id', targetUserId)
          .order('recorded_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setSymptoms(data as Symptom[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSymptoms();
  }, [loggedInUser, userId]);

  if (loading) return <p>Loading symptoms history...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold mb-4">Recent Symptoms</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Symptoms</th>
              <th scope="col" className="px-6 py-3">Severity</th>
              <th scope="col" className="px-6 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.length > 0 ? symptoms.map((symptom) => (
              <tr key={symptom.id} className="bg-white border-b">
                <td className="px-6 py-4">{new Date(symptom.recorded_at).toLocaleString()}</td>
                <td className="px-6 py-4">{symptom.symptoms.join(', ')}</td>
                <td className="px-6 py-4">{symptom.severity || 'N/A'}</td>
                <td className="px-6 py-4">{symptom.notes || 'N/A'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-4">No symptoms logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
