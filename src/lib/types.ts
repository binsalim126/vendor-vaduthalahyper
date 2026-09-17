export type QuestionType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean';

export interface FormQuestion {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  helper_text?: string;
  options?: string[]; // For 'select' and 'multiselect'
  required: boolean;
  is_default: boolean; // default questions cannot be deleted
  order_index: number;
  created_at?: string;
}

export type SubmissionStatus = 'new' | 'in_review' | 'contacted' | 'approved' | 'rejected';

export interface VendorSubmission {
  id: string;
  venture_name: string;
  company_name: string;
  phone: string;
  products: string[];
  custom_answers: Record<string, any>;
  status: SubmissionStatus;
  notes?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
