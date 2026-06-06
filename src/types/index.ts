export type UserRole = 'citizen' | 'officer' | 'admin';

export type ReportStatus = 'Open' | 'Under Review' | 'In Progress' | 'Resolved';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'full_name' | 'email'>;
  report_images?: ReportImage[];
  status_history?: StatusHistoryEntry[];
}

export interface ReportImage {
  id: string;
  report_id: string;
  image_url: string;
  uploaded_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  report_id: string;
  previous_status: string;
  new_status: string;
  notes: string;
  changed_by: string;
  changed_at: string;
  profiles?: Pick<Profile, 'full_name'>;
}
