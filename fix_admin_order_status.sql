-- ============================================
-- COMPREHENSIVE FIX: Admin Order Status Functions
-- ============================================

-- 1. Fix notifications table - add default ID generation
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Also add a fallback pattern-based ID
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'id') THEN
        ALTER TABLE public.notifications ADD COLUMN id TEXT PRIMARY KEY;
    END IF;
END $$;

-- 2. Drop existing functions to ensure clean install
DROP FUNCTION IF EXISTS public.admin_update_order_status_v8(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_ship_order_protocol(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_deliver_order_protocol(TEXT);
DROP FUNCTION IF EXISTS public.admin_cancel_order_protocol(TEXT);

-- 3. Create main update order status function with proper ID generation
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
BEGIN
    -- Check if order exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE id = p_order_id) INTO v_order_exists;
    IF NOT v_order_exists THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    -- Fetch current status
    SELECT status, user_id INTO v_current_status, v_user_id FROM public.orders WHERE id = p_order_id;

    -- Security: Prevent modification of COMPLETED orders
    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Protocol Violation: Completed orders are locked and cannot be modified.';
    END IF;

    -- Update the order status
    UPDATE public.orders 
    SET 
        status = p_new_status,
        tracking_number = COALESCE(p_tracking, tracking_number),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Send notification to user with explicit ID
    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        v_notification_id,
        v_user_id, 
        'Order Status Update',
        'Your order ' || p_order_id || ' has been updated to: ' || p_new_status,
        (extract(epoch from now()) * 1000)::bigint,
        'info'
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Create ship order protocol function
CREATE OR REPLACE FUNCTION public.admin_ship_order_protocol(
    p_order_id TEXT,
    p_tracking_number TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_prod_name TEXT;
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    -- Check order existence and current status
    SELECT user_id, status, (SELECT name FROM products WHERE id = o.product_id) 
    INTO v_user_id, v_current_status, v_prod_name
    FROM public.orders o WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status = 'COMPLETED' OR v_current_status = 'DELIVERED' THEN
        RAISE EXCEPTION 'Cannot ship order in status: %', v_current_status;
    END IF;

    -- Update Status to SHIPPED
    UPDATE public.orders 
    SET 
        status = 'SHIPPED', 
        tracking_number = COALESCE(p_tracking_number, tracking_number),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Notify User with explicit ID
    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        v_notification_id,
        v_user_id, 
        'Package Shipped', 
        'Your gadget is on the move! Order: ' || p_order_id || '. Tracking: ' || COALESCE(p_tracking_number, 'Pending'), 
        (extract(epoch from now()) * 1000)::bigint, 
        'info'
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Create deliver order protocol function
CREATE OR REPLACE FUNCTION public.admin_deliver_order_protocol(
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
        RAISE EXCEPTION 'Order must be SHIPPED before it can be DELIVERED. Current status: %', v_current_status;
    END IF;

    UPDATE public.orders 
    SET 
        status = 'DELIVERED', 
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        v_notification_id,
        v_user_id, 
        'Package Arrived', 
        'Your order ' || p_order_id || ' has reached its destination! Please confirm receipt in the app.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create cancel order protocol function
CREATE OR REPLACE FUNCTION public.admin_cancel_order_protocol(
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC;
    v_pay_method TEXT;
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    SELECT user_id, total_price, payment_method, status 
    INTO v_user_id, v_amount, v_pay_method, v_current_status
    FROM public.orders WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Cannot cancel completed order: %', p_order_id;
    END IF;

    -- If Balance was used, refund it
    IF v_pay_method = 'BALANCE' OR v_pay_method = 'PRE-PAID' THEN
        UPDATE public.users SET balance = balance + v_amount WHERE id = v_user_id;
        
        INSERT INTO public.transactions (id, user_id, user_phone, type, amount, status, date, details)
        VALUES (
            'REF-' || floor(random() * 1000000000)::text, 
            v_user_id, 
            (SELECT phone FROM public.users WHERE id = v_user_id), 
            'REFUND', 
            v_amount, 
            'COMPLETED', 
            (extract(epoch from now()) * 1000)::bigint, 
            'Refund for cancelled order: ' || p_order_id
        );
    END IF;

    -- Mark Order Cancelled - delete it
    DELETE FROM public.orders WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        v_notification_id,
        v_user_id, 
        'Order Cancelled', 
        'Your order ' || p_order_id || ' was cancelled by admin.' || 
        CASE WHEN v_pay_method = 'BALANCE' OR v_pay_method = 'PRE-PAID' THEN ' Funds returned to wallet.' ELSE ' COD request voided.' END, 
        (extract(epoch from now()) * 1000)::bigint, 
        'error'
    );
END;
$$ LANGUAGE plpgsql;

-- 7. GRANT EXECUTE permissions to ALL roles
GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_deliver_order_protocol(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_deliver_order_protocol(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_deliver_order_protocol(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.admin_cancel_order_protocol(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order_protocol(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order_protocol(TEXT) TO service_role;

-- 8. Ensure RLS policies allow operations
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders access" ON public.orders;
CREATE POLICY "Orders access" ON public.orders FOR ALL USING (true);

-- 9. Verify
SELECT 'Functions created successfully!' as status;
SELECT proname FROM pg_proc WHERE proname LIKE 'admin_%order%';
