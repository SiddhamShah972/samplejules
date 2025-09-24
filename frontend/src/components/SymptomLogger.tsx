import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface SymptomLoggerProps {
  onNewSymptom: () => void;
}

export default function SymptomLogger({ onNewSymptom }: SymptomLoggerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<number | ''>(3);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('You must be logged in.');
      setLoading(false);
      return;
    }

    // Convert comma-separated string to a string array
    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);

    if (symptomsArray.length === 0) {
      setMessage('Please enter at least one symptom.');
      setLoading(false);
      return;
    }

    const newSymptom = {
      user_id: user.id,
      symptoms: symptomsArray,
      severity: severity === '' ? null : severity,
      notes,
    };

    try {
      const { error } = await supabase.from('symptoms').insert(newSymptom);
      if (error) throw error;
      setMessage('Symptoms logged successfully!');
      // Clear form
      setSymptoms('');
      setSeverity(3);
      setNotes('');
      // Notify parent to refetch data
      onNewSymptom();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold mb-4">Log New Symptoms</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Symptoms (comma-separated)</label>
          <input id="symptoms" type="text" placeholder="e.g. headache, fever" value={symptoms} onChange={e => setSymptoms(e.target.value)} required className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity (1-5)</label>
          <input id="severity" type="range" min="1" max="5" value={severity} onChange={e => setSeverity(Number(e.target.value))} required className="w-full mt-1" />
          <div className="text-center">{severity}</div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea id="notes" placeholder="e.g. Started this morning" value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Symptoms'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
