
-- FINAL E-COMMERCE MARKETPLACE SETUP
-- This script purges investment features and ensures a clean e-commerce environment.
-- Run this in the Supabase SQL Editor.

-- 1. PURGE INVESTMENT SYSTEM
DROP TABLE IF EXISTS public.user_epoch_investments CASCADE;
DROP TABLE IF EXISTS public.training_epochs CASCADE;
DROP TABLE IF EXISTS public.user_bonds CASCADE;
DROP TABLE IF EXISTS public.bond_templates CASCADE;
DROP TABLE IF EXISTS public.user_stakes CASCADE;
DROP TABLE IF EXISTS public.staking_pools CASCADE;
DROP TABLE IF EXISTS public.user_products CASCADE;
DROP FUNCTION IF EXISTS public.process_automatic_earnings() CASCADE;

-- 2. ENSURE E-COMMERCE CORE TABLES
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint,
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 3. EXTEND USERS & PRODUCTS
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS member_level TEXT DEFAULT 'BRONZE';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = auth.uid()::text OR is_admin = true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage own wishlist" ON public.wishlist FOR ALL USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid()::text);

-- 6. LOYALTY TRIGGER
CREATE OR REPLACE FUNCTION public.update_member_loyalty() RETURNS TRIGGER AS $$
DECLARE
    v_order_count INTEGER;
BEGIN
    SELECT count(*) INTO v_order_count FROM public.orders WHERE user_id = NEW.user_id AND status = 'COMPLETED';
    
    UPDATE public.users SET 
        member_level = CASE 
            WHEN v_order_count >= 20 THEN 'PLATINUM'
            WHEN v_order_count >= 10 THEN 'GOLD'
            WHEN v_order_count >= 3 THEN 'SILVER'
            ELSE 'BRONZE'
        END
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty ON public.orders;
CREATE TRIGGER trigger_update_loyalty
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'COMPLETED')
EXECUTE FUNCTION public.update_member_loyalty();

-- 7. PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
