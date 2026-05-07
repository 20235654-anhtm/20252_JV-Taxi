-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis; -- Bật PostGIS cho xử lý tọa độ/khoảng cách

-- Xoá các bảng cũ (nếu có) để cài đặt lại từ đầu
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

--------------------------------------------------
-- 1. PROFILES
--------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(100),
    role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER','DRIVER','ADMIN')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','BANNED')),

    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------
-- 2. DRIVER PROFILES
--------------------------------------------------
CREATE TABLE driver_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

    average_rating DECIMAL(3,2) DEFAULT 0.00,
    is_online BOOLEAN DEFAULT FALSE,
    is_busy BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,

    vehicle_type VARCHAR(50), -- VD: MOTORBIKE, CAR_4_SEATS, CAR_7_SEATS
    japanese_cer_infor VARCHAR(255),
    driving_license_infor VARCHAR(255) NOT NULL,
    vehicle_infor VARCHAR(255) NOT NULL,
    avatar_picture VARCHAR(500),

    -- Dữ liệu tọa độ hiện tại của tài xế
    current_location GEOGRAPHY(POINT, 4326)
);

-- Index không gian giúp Supabase tìm kiếm tài xế gần nhất cực nhanh
CREATE INDEX idx_driver_location ON driver_profiles USING GIST (current_location);

--------------------------------------------------
-- 3. PAYMENT METHODS
--------------------------------------------------
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    card_details VARCHAR(255) NOT NULL, -- Dùng tạm cho test, thực tế phải mã hoá
    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------
-- 4. RIDES
--------------------------------------------------
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    passenger_id UUID REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id),

    -- Hiển thị UI text
    start_address VARCHAR(500) NOT NULL,
    end_address VARCHAR(500) NOT NULL,

    -- Dữ liệu PostGIS để tính khoảng cách và định tuyến
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326) NOT NULL,

    match_fee DECIMAL(10,2),
    match_type VARCHAR(50),
    vehicle_type_requested VARCHAR(50), -- Loại xe khách yêu cầu
    rejected_driver_ids UUID[] DEFAULT '{}', -- Danh sách ID tài xế đã từ chối (dành cho tự động)

    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED')),

    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------
-- 5. REVIEWS
--------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id),

    star_review INT CHECK (star_review BETWEEN 1 AND 5),
    comment_review TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------
-- 6. PAYMENTS
--------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    ride_id UUID UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id),

    total_amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,

    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','SUCCESS','FAILED')),

    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------------------------------
-- 7. THÊM INDEXES ĐỂ TỐI ƯU HIỆU SUẤT API
--------------------------------------------------
CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_driver_profiles_status ON driver_profiles(is_online, is_busy, is_approved);
CREATE INDEX idx_reviews_driver_id ON reviews(driver_id);

--------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Public xem info (tài xế cần xem info khách và ngược lại)
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Driver Profiles
CREATE POLICY "Public read driver profiles" ON driver_profiles FOR SELECT USING (true);
CREATE POLICY "Drivers update own profile" ON driver_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Rides
CREATE POLICY "Passengers can create rides" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Users view related rides" ON rides FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
CREATE POLICY "Users update related rides" ON rides FOR UPDATE USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- Payment Methods
CREATE POLICY "Manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Read related reviews" ON reviews FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = driver_id);

-- Payments
CREATE POLICY "View related payments" ON payments FOR SELECT 
USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = payments.ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));
CREATE POLICY "Insert own payments" ON payments FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM rides r WHERE r.id = payments.ride_id AND r.passenger_id = auth.uid()));

--------------------------------------------------
-- 9. TRIGGER: TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG KÝ
--------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Thêm Security Definer để bypass RLS

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();