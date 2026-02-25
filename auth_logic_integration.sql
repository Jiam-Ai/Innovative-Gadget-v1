
-- AUTHENTICATION & SECURITY INTEGRATION
-- REFRESHED: 2026-02-23
-- This script secures the marketplace by enforcing Row Level Security (RLS).
-- It ensures that sensitive operations (ordering, cart, wishlist) require a valid user session.

-- 1. Ensure cart_items table exists (if not already created)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
    UNIQUE(user_id, product_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies

-- PRODUCTS: Publicly viewable, Admin-only modifications
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);

-- USERS: Users can only see and edit their own profile data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = auth.uid()::text OR is_admin = true);

-- ORDERS: Users can only view their own order history
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid()::text);

-- CART: Users can only manage their own shopping cart
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (user_id = auth.uid()::text);

-- WISHLIST: Users can only manage their own wishlist
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage own wishlist" ON public.wishlist FOR ALL USING (user_id = auth.uid()::text);

-- TRANSACTIONS: Users can only view their own financial records
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (user_id = auth.uid()::text);

-- NOTIFICATIONS: Users can only view their own alerts
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid()::text);

-- 4. Grant Permissions to Authenticated Users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO anon;
