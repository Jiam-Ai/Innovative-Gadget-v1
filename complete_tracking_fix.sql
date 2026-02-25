-- ============================================
-- COMPLETE ORDER TRACKING SYSTEM FIX
-- ============================================

-- 1. Ensure tracking_number column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
END $$;

-- 2. Drop existing functions that might conflict
DROP FUNCTION IF EXISTS public.track_order(TEXT);
DROP FUNCTION IF EXISTS public.generate_tracking_on_ship(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_ship_order_protocol(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_update_order_status_v8(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.user_finalize_order_protocol(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.user_confirm_order_delivery_v2(TEXT, TEXT);

-- 3. Create main track order function (public - for tracking page)
CREATE OR REPLACE FUNCTION public.track_order(p_search_id TEXT)
RETURNS TABLE (
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
    payment_method TEXT,
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
        o.payment_method,
        p.name as product_name,
        p.image_url as product_image
    FROM public.orders o
    LEFT JOIN public.products p ON o.product_id = p.id
    WHERE UPPER(o.tracking_number) = UPPER(p_search_id)
       OR UPPER(o.id) = UPPER(p_search_id)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.track_order(TEXT) TO anon, authenticated, service_role;

-- 4. Admin ship order function - generates tracking automatically
CREATE OR REPLACE FUNCTION public.admin_ship_order(
    p_order_id TEXT,
    p_tracking_number TEXT DEFAULT NULL
) RETURNS TEXT AS $$
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

    IF v_current_status IN ('COMPLETED', 'DELIVERED', 'SHIPPED') THEN
        RAISE EXCEPTION 'Cannot ship order in status: %', v_current_status;
    END IF;

    -- Generate tracking if not provided
    v_tracking := COALESCE(p_tracking_number, 'TRK-' || upper(substring(md5(p_order_id || now()::text) from 1 for 8)));

    -- Update Status to SHIPPED with tracking
    UPDATE public.orders 
    SET status = 'SHIPPED', tracking_number = v_tracking, updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Package Shipped', 'Your order ' || p_order_id || ' is on the way! Tracking: ' || v_tracking, (extract(epoch from now()) * 1000)::bigint, 'info');

    RETURN v_tracking;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_ship_order(TEXT, TEXT) TO anon, authenticated, service_role;

-- 5. Admin deliver order function
CREATE OR REPLACE FUNCTION public.admin_deliver_order(
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    SELECT user_id, status INTO v_user_id, v_current_status FROM public.orders WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status != 'SHIPPED' THEN
        RAISE EXCEPTION 'Order must be SHIPPED before delivery. Current: %', v_current_status;
    END IF;

    UPDATE public.orders SET status = 'DELIVERED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Package Arrived', 'Your order ' || p_order_id || ' has arrived! Please confirm receipt.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_deliver_order(TEXT) TO anon, authenticated, service_role;

-- 6. User confirm delivery - EXPIRES tracking after confirmation
CREATE OR REPLACE FUNCTION public.user_confirm_delivery(
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
        RAISE EXCEPTION 'Confirmation denied: Order must be DELIVERED to confirm receipt.';
    END IF;

    -- Update status to COMPLETED
    UPDATE public.orders SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    -- EXPIRE TRACKING - Set to NULL when user confirms
    UPDATE public.orders SET tracking_number = NULL WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, p_user_id, 'Order Completed', 'Thank you! Order ' || p_order_id || ' is complete. Tracking expired.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.user_confirm_delivery(TEXT, TEXT) TO anon, authenticated, service_role;

-- 7. Generic update order status function
CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id TEXT,
    p_new_status TEXT,
    p_tracking TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
    v_user_id TEXT;
    v_tracking TEXT;
    v_notification_id TEXT;
BEGIN
    SELECT status, user_id, tracking_number INTO v_current_status, v_user_id, v_tracking FROM public.orders WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Cannot modify completed order.';
    END IF;

    -- Auto-generate tracking for SHIPPED status
    IF p_new_status = 'SHIPPED' AND (p_tracking IS NULL OR p_tracking = '') THEN
        v_tracking := 'TRK-' || upper(substring(md5(p_order_id || now()::text) from 1 for 8));
    ELSIF p_tracking IS NOT NULL AND p_tracking != '' THEN
        v_tracking := p_tracking;
    ELSE
        v_tracking := v_tracking;
    END IF;

    UPDATE public.orders 
    SET status = p_new_status, tracking_number = v_tracking, updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Order Update', 'Order ' || p_order_id || ' status: ' || p_new_status, (extract(epoch from now()) * 1000)::bigint, 'info');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.update_order_status(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- 8. Ensure RLS policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can track orders" ON public.orders;
CREATE POLICY "Anyone can track orders" ON public.orders FOR SELECT USING (true);

-- 9. Create index for fast tracking lookups
DROP INDEX IF EXISTS idx_orders_tracking_lookup;
CREATE INDEX idx_orders_tracking_lookup ON public.orders(tracking_number);

-- 10. Verify
SELECT 'Tracking system fixed!' as status;
SELECT proname, pg_get_function_arguments(oid) as args FROM pg_proc WHERE proname IN ('track_order', 'admin_ship_order', 'admin_deliver_order', 'user_confirm_delivery', 'update_order_status');
