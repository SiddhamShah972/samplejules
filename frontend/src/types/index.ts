// Centralized type definitions for the application

export interface Profile {
  id: string;
  full_name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  role?: 'patient' | 'admin';
  created_at: string;
}

export interface Vital {
  id: string;
  user_id: string;
  recorded_at: string;
  spo2: number | null;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  hemoglobin: number | null;
  weight: number | null;
  notes: string | null;
}

export interface Symptom {
  id: string;
  user_id: string;
  recorded_at: string;
  symptoms: string[];
  severity: number | null;
  notes: string | null;
}
