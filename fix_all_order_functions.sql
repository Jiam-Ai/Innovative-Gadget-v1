-- ============================================
-- COMPREHENSIVE FIX: All Order Functions
-- ============================================

-- 1. Fix notifications table - ensure ID column has default
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 2. Drop all existing functions
DROP FUNCTION IF EXISTS public.admin_update_order_status_v8(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_ship_order_protocol(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_deliver_order_protocol(TEXT);
DROP FUNCTION IF EXISTS public.admin_cancel_order_protocol(TEXT);
DROP FUNCTION IF EXISTS public.user_finalize_order_protocol(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.user_confirm_order_delivery_v2(TEXT, TEXT);

-- 3. ADMIN: Update Order Status
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
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE id = p_order_id) INTO v_order_exists;
    IF NOT v_order_exists THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    SELECT status, user_id INTO v_current_status, v_user_id FROM public.orders WHERE id = p_order_id;

    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Protocol Violation: Completed orders are locked and cannot be modified.';
    END IF;

    UPDATE public.orders 
    SET 
        status = p_new_status,
        tracking_number = COALESCE(p_tracking, tracking_number),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Order Status Update', 'Your order ' || p_order_id || ' updated to: ' || p_new_status, (extract(epoch from now()) * 1000)::bigint, 'info');
END;
$$ LANGUAGE plpgsql;

-- 4. ADMIN: Ship Order
CREATE OR REPLACE FUNCTION public.admin_ship_order_protocol(
    p_order_id TEXT,
    p_tracking_number TEXT DEFAULT NULL
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

    IF v_current_status = 'COMPLETED' OR v_current_status = 'DELIVERED' THEN
        RAISE EXCEPTION 'Cannot ship order in status: %', v_current_status;
    END IF;

    UPDATE public.orders 
    SET status = 'SHIPPED', tracking_number = COALESCE(p_tracking_number, tracking_number), updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Package Shipped', 'Your order ' || p_order_id || ' has been shipped! Tracking: ' || COALESCE(p_tracking_number, 'Pending'), (extract(epoch from now()) * 1000)::bigint, 'info');
END;
$$ LANGUAGE plpgsql;

-- 5. ADMIN: Deliver Order
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
        RAISE EXCEPTION 'Order must be SHIPPED before delivery. Current: %', v_current_status;
    END IF;

    UPDATE public.orders SET status = 'DELIVERED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Package Arrived', 'Your order ' || p_order_id || ' has arrived! Please confirm receipt.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

-- 6. ADMIN: Cancel Order
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
    SELECT user_id, total_price, payment_method, status INTO v_user_id, v_amount, v_pay_method, v_current_status FROM public.orders WHERE id = p_order_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Cannot cancel completed order';
    END IF;

    IF v_pay_method = 'BALANCE' OR v_pay_method = 'PRE-PAID' THEN
        UPDATE public.users SET balance = balance + v_amount WHERE id = v_user_id;
        INSERT INTO public.transactions (id, user_id, user_phone, type, amount, status, date, details)
        VALUES ('REF-' || floor(random() * 1000000000)::text, v_user_id, (SELECT phone FROM public.users WHERE id = v_user_id), 'REFUND', v_amount, 'COMPLETED', (extract(epoch from now()) * 1000)::bigint, 'Refund for cancelled order: ' || p_order_id);
    END IF;

    DELETE FROM public.orders WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, v_user_id, 'Order Cancelled', 'Your order ' || p_order_id || ' was cancelled.' || CASE WHEN v_pay_method = 'BALANCE' THEN ' Funds returned.' ELSE '' END, (extract(epoch from now()) * 1000)::bigint, 'error');
END;
$$ LANGUAGE plpgsql;

-- 7. USER: Finalize Order (when delivered)
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

    UPDATE public.orders SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, p_user_id, 'Order Finalized', 'Thank you! Order ' || p_order_id || ' has been completed.', (extract(epoch from now()) * 1000)::bigint, 'success');
END;
$$ LANGUAGE plpgsql;

-- 8. USER: Confirm Order Delivery (alternative name)
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

    UPDATE public.orders SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint WHERE id = p_order_id;

    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (v_notification_id, p_user_id, 'Order Received', 'You confirmed receipt of order ' || p_order_id, (extract(epoch from now()) * 1000)::bigint, 'success')
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 9. GRANT ALL PERMISSIONS
GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_deliver_order_protocol(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order_protocol(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_finalize_order_protocol(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_confirm_order_delivery_v2(TEXT, TEXT) TO anon, authenticated, service_role;

-- 10. RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders access" ON public.orders;
CREATE POLICY "Orders access" ON public.orders FOR ALL USING (true);

-- 11. Verify
SELECT 'All functions created!' as status;
SELECT proname FROM pg_proc WHERE proname LIKE '%order%' OR proname LIKE '%ship%' OR proname LIKE '%deliver%' OR proname LIKE '%finalize%';
