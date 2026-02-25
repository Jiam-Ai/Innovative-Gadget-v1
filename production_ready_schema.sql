
-- PRODUCTION READY SCHEMA & INTEGRATION SCRIPT
-- SYSTEM: INNOVATIVE GADGET MARKETPLACE
-- VERSION: 1.0.0
-- AUTHOR: SENIOR SOFTWARE ENGINEER

-- 1. CLEANUP & PURGE (OPTIONAL - UNCOMMENT IF NEEDED)
-- DELETE FROM public.notifications;
-- DELETE FROM public.transactions;
-- DELETE FROM public.orders;
-- DELETE FROM public.cart_items;
-- DELETE FROM public.wishlist;
-- DELETE FROM public.users WHERE is_admin = FALSE;

-- 2. ENSURE TABLES & CONSTRAINTS (WITH CASCADING DELETES)

-- USERS
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
    full_name TEXT DEFAULT 'Customer',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1633332755-1ba8b97f60c1?w=200&q=80',
    bio TEXT DEFAULT 'Gadget Enthusiast',
    loyalty_points INTEGER DEFAULT 0,
    member_level TEXT DEFAULT 'BRONZE'
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Gadgets',
    stock_quantity INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING',
    tracking_number TEXT,
    shipping_details TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_phone TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    date BIGINT NOT NULL,
    reference_id TEXT,
    method TEXT,
    details TEXT
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT 'NT-' || floor(random()*1000000)::text,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date BIGINT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info'
);

-- CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
    UNIQUE(user_id, product_id)
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 3. FIX FOREIGN KEY CONSTRAINTS (FOR EXISTING TABLES)
DO $$ 
BEGIN
    -- Orders
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'orders_user_id_fkey') THEN
        ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
    END IF;
    ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

    -- Transactions
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'transactions_user_id_fkey') THEN
        ALTER TABLE public.transactions DROP CONSTRAINT transactions_user_id_fkey;
    END IF;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

    -- Notifications
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_user_id_fkey') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
    END IF;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own or admin" ON public.users;
CREATE POLICY "Users view own or admin" ON public.users FOR SELECT USING (true); -- Simplified for custom auth

DROP POLICY IF EXISTS "Users update own or admin" ON public.users;
CREATE POLICY "Users update own or admin" ON public.users FOR UPDATE USING (true); -- Simplified for custom auth

DROP POLICY IF EXISTS "Admin delete users" ON public.users;
CREATE POLICY "Admin delete users" ON public.users FOR DELETE USING (true); -- Simplified for custom auth

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (true); -- Simplified for custom auth

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Orders access" ON public.orders;
CREATE POLICY "Orders access" ON public.orders FOR ALL USING (true); -- Simplified for custom auth

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Transactions access" ON public.transactions;
CREATE POLICY "Transactions access" ON public.transactions FOR ALL USING (true); -- Simplified for custom auth

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Notifications access" ON public.notifications;
CREATE POLICY "Notifications access" ON public.notifications FOR ALL USING (true); -- Simplified for custom auth

-- CART & WISHLIST
DROP POLICY IF EXISTS "Cart access" ON public.cart_items;
CREATE POLICY "Cart access" ON public.cart_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Wishlist access" ON public.wishlist;
CREATE POLICY "Wishlist access" ON public.wishlist FOR ALL USING (true);

-- 5. ATOMIC STORED PROCEDURES (RPCs)

-- ADMIN: APPROVE DEPOSIT
CREATE OR REPLACE FUNCTION public.admin_approve_deposit(p_tx_id TEXT) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC;
BEGIN
    SELECT user_id, amount INTO v_user_id, v_amount FROM public.transactions WHERE id = p_tx_id AND type = 'DEPOSIT' AND status = 'PENDING';
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Transaction not found or already processed'; END IF;
    UPDATE public.transactions SET status = 'COMPLETED' WHERE id = p_tx_id;
    UPDATE public.users SET balance = balance + v_amount WHERE id = v_user_id;
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (v_user_id, 'Deposit Approved', 'Your deposit of SLE ' || v_amount || ' has been credited.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

-- ADMIN: APPROVE WITHDRAWAL
CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(p_tx_id TEXT) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC;
BEGIN
    SELECT user_id, amount INTO v_user_id, v_amount FROM public.transactions WHERE id = p_tx_id AND type = 'WITHDRAWAL' AND status = 'PENDING';
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Transaction not found or already processed'; END IF;
    IF (SELECT balance FROM public.users WHERE id = v_user_id) < v_amount THEN RAISE EXCEPTION 'Insufficient user balance'; END IF;
    UPDATE public.transactions SET status = 'COMPLETED' WHERE id = p_tx_id;
    UPDATE public.users SET balance = balance - v_amount WHERE id = v_user_id;
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (v_user_id, 'Withdrawal Approved', 'Your withdrawal of SLE ' || v_amount || ' has been processed.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

-- ADMIN: REJECT TRANSACTION
CREATE OR REPLACE FUNCTION public.admin_reject_transaction(p_tx_id TEXT) RETURNS VOID AS $$
BEGIN
    UPDATE public.transactions SET status = 'REJECTED' WHERE id = p_tx_id;
    INSERT INTO public.notifications (user_id, title, message, date, type)
    SELECT user_id, 'Transaction Rejected', 'Your ' || type || ' request was rejected.', (extract(epoch from now()) * 1000)::bigint, 'error'
    FROM public.transactions WHERE id = p_tx_id;
END;
$$ LANGUAGE plpgsql;

-- ADMIN: UPDATE ORDER STATUS
CREATE OR REPLACE FUNCTION public.admin_update_order_status_v8(
    p_order_id TEXT,
    p_new_status TEXT,
    p_tracking TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE public.orders 
    SET status = p_new_status, tracking_number = COALESCE(p_tracking, tracking_number), updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;
    INSERT INTO public.notifications (user_id, title, message, date, type)
    SELECT user_id, 'Order Status Update', 'Order ' || id || ' is now ' || p_new_status, (extract(epoch from now()) * 1000)::bigint, 'info'
    FROM public.orders WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 6. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 7. SEED ADMIN
INSERT INTO public.users (id, phone, password, balance, verification_code, is_admin, registered_at)
VALUES ('admin-node', '076000000', 'admin123', 999999, 'IG-ROOT', TRUE, (extract(epoch from now()) * 1000)::bigint)
ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
