/*
  # Initial Schema for Salon Booking System

  1. New Tables
    - `users` - User profiles with role-based access
    - `salons` - Salon/business information with multi-tenant support
    - `stylists` - Stylist profiles linked to salons
    - `services` - Services offered by salons
    - `appointments` - Booking appointments with full lifecycle
    - `business_hours` - Operating hours for salons
    - `stylist_schedules` - Individual stylist availability
    - `customer_profiles` - Extended customer information

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - Role-based access control policies

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for tenant isolation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('salon_owner', 'stylist', 'customer')),
  salon_id uuid,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Salons table
CREATE TABLE IF NOT EXISTS salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timezone text DEFAULT 'America/New_York',
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, day_of_week)
);

-- Stylists table
CREATE TABLE IF NOT EXISTS stylists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  specialties text[] DEFAULT '{}',
  bio text,
  hourly_rate decimal(10,2),
  commission_rate decimal(5,2) DEFAULT 50.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  preferred_stylist_id uuid REFERENCES stylists(id),
  notes text,
  allergies text,
  hair_type text,
  hair_color text,
  last_visit timestamptz,
  total_visits integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stylist_id uuid NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes text,
  internal_notes text,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  deposit_amount decimal(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stylist schedules table (for custom availability)
CREATE TABLE IF NOT EXISTS stylist_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id uuid NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  break_start time,
  break_end time,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(stylist_id, date)
);

-- Add foreign key constraint for salon_id in users table
ALTER TABLE users ADD CONSTRAINT fk_users_salon_id 
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_salon_id ON users(salon_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_salons_owner_id ON salons(owner_id);
CREATE INDEX IF NOT EXISTS idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_salon_id ON customer_profiles(salon_id);
CREATE INDEX IF NOT EXISTS idx_stylist_schedules_salon_id ON stylist_schedules(salon_id);
CREATE INDEX IF NOT EXISTS idx_stylist_schedules_date ON stylist_schedules(date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Salon owners can read salon users"
  ON users FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for salons table
CREATE POLICY "Salon owners can manage their salons"
  ON salons FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Salon staff can read their salon"
  ON salons FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT salon_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for business_hours table
CREATE POLICY "Salon owners can manage business hours"
  ON business_hours FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon staff can read business hours"
  ON business_hours FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT salon_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for stylists table
CREATE POLICY "Salon owners can manage stylists"
  ON stylists FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can read own profile"
  ON stylists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Stylists can update own profile"
  ON stylists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for services table
CREATE POLICY "Salon owners can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon staff can read services"
  ON services FOR SELECT
  TO authenticated
  USING (
    salon_id IN (
      SELECT salon_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for customer_profiles table
CREATE POLICY "Salon staff can manage customer profiles"
  ON customer_profiles FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT salon_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can read own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for appointments table
CREATE POLICY "Salon staff can manage appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT salon_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Customers can read own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for stylist_schedules table
CREATE POLICY "Salon owners can manage stylist schedules"
  ON stylist_schedules FOR ALL
  TO authenticated
  USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can manage own schedule"
  ON stylist_schedules FOR ALL
  TO authenticated
  USING (
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON stylists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stylist_schedules_updated_at BEFORE UPDATE ON stylist_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();