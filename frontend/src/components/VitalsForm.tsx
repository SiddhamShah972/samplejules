import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface VitalsFormProps {
  onNewVital: () => void;
}

export default function VitalsForm({ onNewVital }: VitalsFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [spo2, setSpo2] = useState<number | ''>('');
  const [systolic, setSystolic] = useState<number | ''>('');
  const [diastolic, setDiastolic] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
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

    const newVital = {
      user_id: user.id,
      spo2: spo2 === '' ? null : spo2,
      systolic: systolic === '' ? null : systolic,
      diastolic: diastolic === '' ? null : diastolic,
      heart_rate: heartRate === '' ? null : heartRate,
      weight: weight === '' ? null : weight,
      notes,
    };

    try {
      const { error } = await supabase.from('vitals').insert(newVital);
      if (error) throw error;
      setMessage('Vitals submitted successfully!');
      // Clear form
      setSpo2('');
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setWeight('');
      setNotes('');
      // Notify parent to refetch data
      onNewVital();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Log New Vitals</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="number" placeholder="Blood Oxygen (SpO2 %)" value={spo2} onChange={e => setSpo2(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded-md" />
        <input type="number" placeholder="Systolic (mmHg)" value={systolic} onChange={e => setSystolic(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded-md" />
        <input type="number" placeholder="Diastolic (mmHg)" value={diastolic} onChange={e => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded-md" />
        <input type="number" placeholder="Heart Rate (bpm)" value={heartRate} onChange={e => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded-md" />
        <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded-md" />
        <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="md:col-span-2 p-2 border rounded-md" />
        <button type="submit" disabled={loading} className="md:col-span-2 w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Vitals'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
