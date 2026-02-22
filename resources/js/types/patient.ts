// resources/js/types/patient.ts
export interface Patient {
  // Basic Infos
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  cin?: string | null;
  // Medical Infos
  blood_group?: string | null;
  allergies?: string | null;
  chronic_diseases?: string | null;
  notes?: string | null;
  is_pregnant?: boolean;
  created_at: string;
  deleted_at?: string | null;
}