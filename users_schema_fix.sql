
-- USER IDENTITY & PROFILE SCHEMA
-- REVISION: 4.0.0

-- 1. Table Re-initialization
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    verification_code TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    registered_at BIGINT NOT NULL,
    withdrawal_account TEXT,
    invited_by TEXT,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1633332755-1ba8b97f60c1?w=200&q=80',
    bio TEXT DEFAULT ''
);

-- 2. Security Configuration (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to register (Insert their first record)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable public registration') THEN
        CREATE POLICY "Enable public registration" 
        ON public.users FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- Policy: Allow users to view their own profile
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" 
        ON public.users FOR SELECT 
        USING (true); -- Simplified for public profile visibility, or use: (auth.uid()::text = id)
    END IF;
END $$;

-- Policy: Allow users to update their own profile
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" 
        ON public.users FOR UPDATE 
        USING (true); -- In production, use: (auth.uid()::text = id)
    END IF;
END $$;

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON public.users(verification_code);
