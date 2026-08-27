// TypeScript interfaces for CityPulse

export interface Complaint {
  id: number;
  phone_number?: string;
  reporter_phone?: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  ward_id?: number;
  ward_name?: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  confirmation_count: number;
  severity_score: number;
  assigned_officer_id?: number;
  assigned_officer_name?: string;
  officer_name?: string;
  officer_department?: string;
  officer_phone?: string | null;
  assigned_by_supervisor_id?: number | null;
  assigned_by_supervisor_name?: string | null;
  reopened_count: number;
  is_recurring?: boolean;
  total_cycles?: number;
  months_span?: number;
  days_unresolved?: number;
  is_chronic_overdue?: boolean;
  evidence_photos?: string[];
  photo_url?: string | null;
  photo_after_url?: string | null;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface Ward {
  id: number;
  ward_number: number;
  ward_name: string;
  name?: string;
  population?: number;
  area_sq_km?: number;
}

export interface Officer {
  id: number;
  name: string;
  phone?: string;
  department: string;
  ward_id?: number;
  ward_name?: string;
  active_complaints?: number;
  resolved_complaints?: number;
  active_assigned?: number;
  assigned_total?: number;
  created_at?: string;
}

export interface TransparencyStats {
  total_complaints: number;
  resolved_complaints: number;
  pending_complaints: number;
  avg_resolution_hours: number;
  wards: {
    ward_name: string;
    total: number;
    resolved: number;
  }[];
}

export interface StatusLog {
  id: number;
  complaint_id: number;
  old_status: string;
  new_status: string;
  changed_by?: string | number;
  officer_name?: string;
  changed_at: string;
}
