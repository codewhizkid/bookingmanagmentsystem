export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'salon_owner' | 'stylist' | 'customer';
  salon_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Salon {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  owner_id: string;
  business_hours: BusinessHours[];
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Stylist {
  id: string;
  user_id: string;
  salon_id: string;
  specialties: string[];
  bio?: string;
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
  is_active: boolean;
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  total_amount: number;
  customer?: User;
  stylist?: Stylist;
  service?: Service;
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
}