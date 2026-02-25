-- ============================================
-- COMPREHENSIVE FIX: Order Tracking System
-- ============================================

-- 1. Ensure tracking_number column exists with proper indexing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
END $$;

-- 2. Create index for tracking lookups (case-insensitive)
DROP INDEX IF EXISTS idx_orders_tracking_number;
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);

-- 3. Create a public function to track orders (allows case-insensitive search)
CREATE OR REPLACE FUNCTION public.track_order(
    p_tracking_id TEXT
) RETURNS TABLE (
    id TEXT,
    user_id TEXT,
    product_id TEXT,
    quantity INTEGER,
    total_price NUMERIC,
    status TEXT,
    tracking_number TEXT,
    shipping_details TEXT,
    created_at BIGINT,
    updated_at BIGINT,
    product_name TEXT,
    product_image TEXT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        o.id,
        o.user_id,
        o.product_id,
        o.quantity,
        o.total_price,
        o.status,
        o.tracking_number,
        o.shipping_details,
        o.created_at,
        o.updated_at,
        p.name as product_name,
        p.image_url as product_image
    FROM public.orders o
    LEFT JOIN public.products p ON o.product_id = p.id
    WHERE UPPER(o.tracking_number) = UPPER(p_tracking_id)
       OR UPPER(o.id) = UPPER(p_tracking_id);
END;
$$ LANGUAGE plpgsql;

-- 4. Grant execute to all roles
GRANT EXECUTE ON FUNCTION public.track_order(TEXT) TO anon, authenticated, service_role;

-- 5. Create function to auto-generate tracking on ship
CREATE OR REPLACE FUNCTION public.generate_tracking_on_ship(
    p_order_id TEXT,
    p_tracking_number TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_tracking TEXT;
    v_current_status TEXT;
BEGIN
    SELECT status INTO v_current_status FROM public.orders WHERE id = p_order_id;
    
    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;
    
    -- Generate tracking if not provided
    v_tracking := COALESCE(p_tracking_number, 'TRK-' || upper(substring(md5(p_order_id || random()::text) from 1 for 8)));
    
    -- Update order with tracking and status to SHIPPED
    UPDATE public.orders 
    SET 
        tracking_number = v_tracking,
        status = 'SHIPPED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;
    
    RETURN v_tracking;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.generate_tracking_on_ship(TEXT, TEXT) TO anon, authenticated, service_role;

-- 6. Update admin_ship_order to use the new function
CREATE OR REPLACE FUNCTION public.admin_ship_order_protocol(
    p_order_id TEXT,
    p_tracking_number TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_current_status TEXT;
    v_tracking TEXT;
    v_notification_id TEXT;
BEGIN
    SELECT user_id, status INTO v_user_id, v_current_status FROM public.orders WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status = 'COMPLETED' OR v_current_status = 'DELIVERED' THEN
        RAISE EXCEPTION 'Cannot ship order in status: %', v_current_status;
    END IF;

    -- Generate tracking number
    v_tracking := COALESCE(p_tracking_number, 'TRK-' || upper(substring(md5(p_order_id || random()::text) from 1 for 8)));

    -- Update Status to SHIPPED with tracking
    UPDATE public.orders 
    SET status = 'SHIPPED', tracking_number = v_tracking, updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Package Shipped', 'Your order ' || p_order_id || ' has been shipped! Tracking: ' || v_tracking, (extract(epoch from now()) * 1000)::bigint, 'info');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO anon, authenticated, service_role;

-- 7. Update admin_update_order_status_v8 to also generate tracking when shipping
CREATE OR REPLACE FUNCTION public.admin_update_order_status_v8(
    p_order_id TEXT,
    p_new_status TEXT,
    p_tracking TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
    v_user_id TEXT;
    v_order_exists BOOLEAN;
    v_notification_id TEXT;
    v_tracking TEXT;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE id = p_order_id) INTO v_order_exists;
    IF NOT v_order_exists THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    SELECT status, user_id INTO v_current_status, v_user_id FROM public.orders WHERE id = p_order_id;

    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Protocol Violation: Completed orders are locked and cannot be modified.';
    END IF;

    -- Auto-generate tracking if shipping and no tracking provided
    IF p_new_status = 'SHIPPED' AND (p_tracking IS NULL OR p_tracking = '') THEN
        v_tracking := 'TRK-' || upper(substring(md5(p_order_id || random()::text) from 1 for 8));
    ELSE
        v_tracking := p_tracking;
    END IF;

    -- Update the order status
    UPDATE public.orders 
    SET 
        status = p_new_status,
        tracking_number = COALESCE(v_tracking, tracking_number),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Order Status Update', 'Your order ' || p_order_id || ' updated to: ' || p_new_status || CASE WHEN v_tracking IS NOT NULL THEN '. Tracking: ' || v_tracking ELSE '' END, (extract(epoch from now()) * 1000)::bigint, 'info');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- 8. Ensure RLS allows public tracking lookups
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public track orders" ON public.orders;
CREATE POLICY "Public track orders" ON public.orders FOR SELECT USING (true);

-- 9. Verify
SELECT 'Tracking system updated!' as status;
SELECT proname FROM pg_proc WHERE proname IN ('track_order', 'generate_tracking_on_ship');
