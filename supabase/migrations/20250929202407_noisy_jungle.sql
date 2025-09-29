/*
  # Sample Data for Development

  1. Sample salon and users
  2. Services and stylists
  3. Sample appointments
  4. Business hours setup
*/

-- Insert sample salon owner
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'owner@salonbook.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample customer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'customer@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample stylist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'stylist@salonbook.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample salon
INSERT INTO salons (id, name, description, address, city, state, zip_code, phone, email, owner_id)
VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  'Elite Hair Studio',
  'Premium hair salon offering cutting-edge styles and treatments',
  '123 Main Street',
  'New York',
  'NY',
  '10001',
  '(555) 123-4567',
  'info@elitehairstudio.com',
  '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO users (id, email, full_name, phone, role, salon_id)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'owner@salonbook.com',
    'Sarah Johnson',
    '(555) 123-4567',
    'salon_owner',
    '660e8400-e29b-41d4-a716-446655440000'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'customer@example.com',
    'John Smith',
    '(555) 987-6543',
    'customer',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'stylist@salonbook.com',
    'Maria Garcia',
    '(555) 456-7890',
    'stylist',
    '660e8400-e29b-41d4-a716-446655440000'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert business hours (Monday to Saturday, closed Sunday)
INSERT INTO business_hours (salon_id, day_of_week, open_time, close_time, is_closed)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440000', 0, NULL, NULL, true),  -- Sunday - Closed
  ('660e8400-e29b-41d4-a716-446655440000', 1, '09:00', '18:00', false), -- Monday
  ('660e8400-e29b-41d4-a716-446655440000', 2, '09:00', '18:00', false), -- Tuesday
  ('660e8400-e29b-41d4-a716-446655440000', 3, '09:00', '18:00', false), -- Wednesday
  ('660e8400-e29b-41d4-a716-446655440000', 4, '09:00', '20:00', false), -- Thursday
  ('660e8400-e29b-41d4-a716-446655440000', 5, '09:00', '20:00', false), -- Friday
  ('660e8400-e29b-41d4-a716-446655440000', 6, '08:00', '17:00', false)  -- Saturday
ON CONFLICT (salon_id, day_of_week) DO NOTHING;

-- Insert stylist profile
INSERT INTO stylists (id, user_id, salon_id, specialties, bio, hourly_rate, commission_rate)
VALUES (
  '770e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440000',
  ARRAY['Hair Cutting', 'Hair Coloring', 'Styling', 'Treatments'],
  'Experienced stylist with 8+ years in the industry. Specializes in modern cuts and color techniques.',
  75.00,
  60.00
) ON CONFLICT (user_id, salon_id) DO NOTHING;

-- Insert services
INSERT INTO services (salon_id, name, description, duration_minutes, price, category, color)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Haircut & Style',
    'Professional haircut with wash and style',
    60,
    65.00,
    'Hair Cutting',
    '#3B82F6'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Hair Color - Full',
    'Complete hair coloring service',
    120,
    150.00,
    'Hair Coloring',
    '#7C3AED'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Hair Color - Touch Up',
    'Root touch-up and color refresh',
    90,
    95.00,
    'Hair Coloring',
    '#7C3AED'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Deep Conditioning Treatment',
    'Intensive hair treatment and conditioning',
    45,
    45.00,
    'Treatments',
    '#0D9488'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Blowout & Style',
    'Professional blowout and styling',
    45,
    40.00,
    'Styling',
    '#059669'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Highlights - Partial',
    'Partial highlights with toner',
    105,
    120.00,
    'Hair Coloring',
    '#7C3AED'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Highlights - Full',
    'Full head highlights with toner',
    150,
    180.00,
    'Hair Coloring',
    '#7C3AED'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'Keratin Treatment',
    'Smoothing keratin treatment',
    180,
    250.00,
    'Treatments',
    '#0D9488'
  )
ON CONFLICT DO NOTHING;

-- Insert customer profile
INSERT INTO customer_profiles (user_id, salon_id, preferred_stylist_id, notes, hair_type, hair_color, total_visits, total_spent)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440000',
  '770e8400-e29b-41d4-a716-446655440000',
  'Prefers shorter styles, sensitive to certain products',
  'Fine',
  'Brown',
  3,
  195.00
) ON CONFLICT (user_id, salon_id) DO NOTHING;