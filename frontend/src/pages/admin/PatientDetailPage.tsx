import { Profile } from '../../types';
import VitalsHistory from '../../components/VitalsHistory';
import SymptomsHistory from '../../components/SymptomsHistory';

interface PatientDetailPageProps {
  patient: Profile;
  onBack: () => void;
}

export default function PatientDetailPage({ patient, onBack }: PatientDetailPageProps) {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <p className="text-lg text-gray-600">{patient.full_name || 'N/A'}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Back to Patient List
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
            <div className="space-y-2">
                <p><strong>Email:</strong> {patient.id ? 'Loading...' : 'N/A' /* Need to join with auth.users to get email */}</p>
                <p><strong>Age:</strong> {patient.age || 'N/A'}</p>
                <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
                <p><strong>Weight:</strong> {patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
                <p><strong>Height:</strong> {patient.height ? `${patient.height} cm` : 'N/A'}</p>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* We will pass the patient's ID to these components */}
          <VitalsHistory userId={patient.id} />
          <SymptomsHistory userId={patient.id} />
        </div>
      </div>
    </div>
  );
}
