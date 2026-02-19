
-- 1. Wishlist System
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 2. Extend Users for Loyalty Levels
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS member_level TEXT DEFAULT 'BRONZE'; -- BRONZE, SILVER, GOLD, PLATINUM

-- 3. Extend Products for Popularity
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;

-- 4. Enable Realtime for Wishlist
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist;
COMMIT;

-- 5. Auto-Update Member Level Function
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

CREATE TRIGGER trigger_update_loyalty
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'COMPLETED')
EXECUTE FUNCTION public.update_member_loyalty();
