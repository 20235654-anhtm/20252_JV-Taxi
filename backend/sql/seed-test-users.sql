-- =====================================================
-- SEED: Tạo 2 test users để test CRUD backend
-- Chạy file này trong: Supabase Dashboard → SQL Editor
-- =====================================================

-- User 1: Khách hàng (Rider)
-- ID cố định để dễ dùng trong test script
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'test-rider@jvtaxi.dev',
  crypt('Test@123456', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Khách Hàng Test"}',
  'authenticated',
  'authenticated',
  '', ''
) ON CONFLICT (id) DO NOTHING;

-- User 2: Tài xế (Driver)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'test-driver@jvtaxi.dev',
  crypt('Test@123456', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Tài Xế Test"}',
  'authenticated',
  'authenticated',
  '', ''
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Kiểm tra kết quả: trigger handle_new_user
-- sẽ tự động tạo row trong bảng profiles
-- =====================================================
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.role,
  p.status,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Nếu trả về 2 rows → sẵn sàng chạy: npx ts-node test-crud.ts
-- Nếu trả về 0 rows → trigger chưa hoạt động, thêm thủ công:
-- INSERT INTO profiles (id) VALUES
--   ('11111111-1111-1111-1111-111111111111'),
--   ('22222222-2222-2222-2222-222222222222')
-- ON CONFLICT (id) DO NOTHING;
