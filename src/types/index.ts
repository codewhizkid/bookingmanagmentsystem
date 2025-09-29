export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'salon_owner' | 'stylist' | 'customer';
  salon_id?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Salon {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website?: string;
  owner_id: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  business_hours?: BusinessHours[];
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  salon_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stylist {
  id: string;
  user_id: string;
  salon_id: string;
  specialties: string[];
  bio?: string;
  hourly_rate?: number;
  commission_rate: number;
  is_active: boolean;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  salon_id: string;
  preferred_stylist_id?: string;
  notes?: string;
  allergies?: string;
  hair_type?: string;
  hair_color?: string;
  last_visit?: string;
  total_visits: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  customer_id: string;
  stylist_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  internal_notes?: string;
  total_amount: number;
  deposit_amount: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  cancellation_reason?: string;
  cancelled_at?: string;
  customer?: User;
  stylist?: Stylist;
  service?: Service;
  created_at: string;
  updated_at: string;
}

export interface StylistSchedule {
  id: string;
  stylist_id: string;
  salon_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  break_start?: string;
  break_end?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  salon: Salon | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  appointment?: Appointment;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}