-- ============================================
-- FIX: Product Delete & Tracking Logic
-- ============================================

-- 1. Ensure tracking_number column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
END $$;

-- 2. Create function to delete product
CREATE OR REPLACE FUNCTION public.admin_delete_product(
    p_product_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_product_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.products WHERE id = p_product_id) INTO v_product_exists;
    
    IF NOT v_product_exists THEN
        RAISE EXCEPTION 'Product not found: %', p_product_id;
    END IF;

    -- Delete the product
    DELETE FROM public.products WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to update tracking number on ship
CREATE OR REPLACE FUNCTION public.set_order_tracking(
    p_order_id TEXT,
    p_tracking_number TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    SELECT status INTO v_current_status FROM public.orders WHERE id = p_order_id;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    -- Set tracking number (only if not already set or if provided)
    UPDATE public.orders 
    SET 
        tracking_number = COALESCE(p_tracking_number, 'TRK-' || upper(substring(md5(random()::text) from 1 for 8))),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to expire tracking when order is completed
CREATE OR REPLACE FUNCTION public.expire_order_tracking(
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    SELECT status INTO v_current_status FROM public.orders WHERE id = p_order_id;

    -- Only expire tracking for completed orders
    IF v_current_status = 'COMPLETED' THEN
        UPDATE public.orders 
        SET tracking_number = NULL, updated_at = (extract(epoch from now()) * 1000)::bigint
        WHERE id = p_order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Modify user finalize to expire tracking
CREATE OR REPLACE FUNCTION public.user_finalize_order_protocol(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = p_user_id AND status = 'DELIVERED'
    ) THEN
        RAISE EXCEPTION 'Finalization Denied: Order must be in DELIVERED state for confirmation.';
    END IF;

    -- Update status to COMPLETED
    UPDATE public.orders SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    -- Expire the tracking number (set to NULL)
    UPDATE public.orders SET tracking_number = NULL WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, p_user_id, 'Order Finalized', 'Thank you! Order ' || p_order_id || ' has been completed. Tracking expired.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

-- 6. Alternative confirm delivery that also expires tracking
CREATE OR REPLACE FUNCTION public.user_confirm_order_delivery_v2(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = p_user_id AND status IN ('SHIPPED', 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Protocol Denied: Order must be SHIPPED or DELIVERED to confirm.';
    END IF;

    -- Update status to COMPLETED
    UPDATE public.orders SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    -- Expire tracking number
    UPDATE public.orders SET tracking_number = NULL WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, p_user_id, 'Order Received', 'You confirmed receipt of order ' || p_order_id || '. Tracking expired.', (extract(epoch from now()) * 1000)::bigint, 'success')
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 7. GRANT permissions
GRANT EXECUTE ON FUNCTION public.admin_delete_product(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_order_tracking(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.expire_order_tracking(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_finalize_order_protocol(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_confirm_order_delivery_v2(TEXT, TEXT) TO anon, authenticated, service_role;

-- 8. Ensure RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products access" ON public.products;
CREATE POLICY "Products access" ON public.products FOR ALL USING (true);

-- 9. Verify
SELECT 'All functions created!' as status;
SELECT proname FROM pg_proc WHERE proname IN ('admin_delete_product', 'set_order_tracking', 'expire_order_tracking');
