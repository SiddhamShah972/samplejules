import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface ProfilePageProps {
  navigateToDashboard: () => void;
}

export default function ProfilePage({ navigateToDashboard }: ProfilePageProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAge(profile.age || '');
      setGender(profile.gender || '');
      setWeight(profile.weight || '');
      setHeight(profile.height || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    const updates = {
      id: user.id,
      full_name: fullName,
      age: age === '' ? null : age,
      gender,
      weight: weight === '' ? null : weight,
      height: height === '' ? null : height,
      updated_at: new Date(),
    };

    try {
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      setMessage('Profile updated successfully!');
      // Note: The AuthContext will automatically fetch the updated profile.
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <button
          onClick={navigateToDashboard}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </header>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="text" value={user?.email || ''} disabled className="w-full mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
            <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <input id="gender" type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
