export type ContactStatus = 
  | 'LEAD'
  | 'MQL'
  | 'SQL'
  | 'OPPORTUNITY'
  | 'CUSTOMER'
  | 'EVANGELIST'
  | 'DORMANT';

export type ContactTemperature = 'HOT' | 'WARM' | 'COLD';

export interface Contact {
  contact_id: number;
  company_id: number;
  assigned_emp_id: number;
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
  status: ContactStatus;
  temperature: ContactTemperature;
  source?: string;
  interest_score: number;
  tracking_token?: string;
  created_at: string;
  updated_at: string;
  average_rating?: number; // Calculated from sessions
}

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
  temperature?: ContactTemperature;
  source?: string;
}

export interface UpdateContactData {
  name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  temperature?: ContactTemperature;
}

export interface ContactFilters {
  status?: ContactStatus;
  temperature?: ContactTemperature;
  assigned_emp_id?: number;
  limit?: number;
  offset?: number;
}