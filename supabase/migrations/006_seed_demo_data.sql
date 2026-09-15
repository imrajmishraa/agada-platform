-- =====================================================
-- Seed demo data — realistic Maharashtra village scenario
-- Safe to run multiple times (idempotent-ish via ON CONFLICT)
-- =====================================================

-- Create 5 patients if they don't exist
insert into public.patients (full_name, age, gender, phone, village, district, state, pincode, address, emergency_contact)
select * from (values
  ('Rajan Patil', 45, 'MALE', '+919812340001', 'Wadgaon', 'Pune', 'Maharashtra', '412208', 'House 12, Wadgaon', '+919812340011'),
  ('Sunita Deshmukh', 32, 'FEMALE', '+919812340002', 'Shirur', 'Pune', 'Maharashtra', '412208', 'Near temple, Shirur', '+919812340012'),
  ('Arjun Kale', 8, 'MALE', null, 'Baramati', 'Pune', 'Maharashtra', '413102', null, '+919812340013'),
  ('Lakshmi Jadhav', 67, 'FEMALE', '+919812340004', 'Wadgaon', 'Pune', 'Maharashtra', '412208', null, '+919812340014'),
  ('Imran Shaikh', 28, 'MALE', '+919812340005', 'Shirur', 'Pune', 'Maharashtra', '412208', null, '+919812340015')
) as v(full_name, age, gender, phone, village, district, state, pincode, address, emergency_contact)
where not exists (select 1 from public.patients where phone = v.phone);

-- Verify
select id, full_name, age, village from public.patients order by full_name;
