-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    is_approved BOOLEAN DEFAULT FALSE,

    japanese_cer_infor VARCHAR(255),
    driving_license_infor VARCHAR(255) NOT NULL,
    vehicle_infor VARCHAR(255) NOT NULL,
    avatar_picture VARCHAR(500)
);

--------------------------------------------------
-- 3. PAYMENT METHODS
--------------------------------------------------
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    card_details VARCHAR(255) NOT NULL,
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

    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,

    match_fee DECIMAL(10,2),
    match_type VARCHAR(50),

    status TEXT DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','ACCEPTED','COMPLETED','CANCELLED')),

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

-- enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- create Policy
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Xem ride của mình
CREATE POLICY "Users can view own rides"
ON rides
FOR SELECT
USING (
    auth.uid() = passenger_id OR auth.uid() = driver_id
);

-- Tạo ride (chỉ passenger)
CREATE POLICY "Users can create rides"
ON rides
FOR INSERT
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Users manage own payment methods"
ON payment_methods
FOR ALL
USING (auth.uid() = user_id);


-- Create trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

