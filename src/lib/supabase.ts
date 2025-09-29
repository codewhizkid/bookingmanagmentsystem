import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const dbHelpers = {
  // Get salon with business hours
  async getSalonWithHours(salonId: string) {
    const { data, error } = await supabase
      .from('salons')
      .select(`
        *,
        business_hours (*)
      `)
      .eq('id', salonId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get stylists for a salon
  async getSalonStylists(salonId: string) {
    const { data, error } = await supabase
      .from('stylists')
      .select(`
        *,
        user:users (*)
      `)
      .eq('salon_id', salonId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  // Get services for a salon
  async getSalonServices(salonId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get appointments for a date range
  async getAppointments(salonId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:users!customer_id (*),
        stylist:stylists!stylist_id (*, user:users (*)),
        service:services (*)
      `)
      .eq('salon_id', salonId)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create new appointment
  async createAppointment(appointmentData: any) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select(`
        *,
        customer:users!customer_id (*),
        stylist:stylists!stylist_id (*, user:users (*)),
        service:services (*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string) {
    const updateData: any = { status };
    if (notes) updateData.internal_notes = notes;
    if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select(`
        *,
        customer:users!customer_id (*),
        stylist:stylists!stylist_id (*, user:users (*)),
        service:services (*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get customer profile
  async getCustomerProfile(userId: string, salonId: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('salon_id', salonId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update customer profile
  async upsertCustomerProfile(profileData: any) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .upsert(profileData)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
};