-- ============================================
-- FIX: User Confirm Delivery
-- ============================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.user_confirm_delivery(TEXT, TEXT);

-- Create fixed function that accepts SHIPPED or DELIVERED status
CREATE OR REPLACE FUNCTION public.user_confirm_delivery(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
    v_notification_id TEXT;
BEGIN
    -- Check if order exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Order not found or access denied.';
    END IF;

    -- Get current status
    SELECT status INTO v_current_status FROM public.orders WHERE id = p_order_id;

    -- Allow confirmation from SHIPPED or DELIVERED status
    IF v_current_status NOT IN ('SHIPPED', 'DELIVERED') THEN
        RAISE EXCEPTION 'Order must be SHIPPED or DELIVERED to confirm receipt. Current status: %', v_current_status;
    END IF;

    -- Update status to COMPLETED
    UPDATE public.orders 
    SET status = 'COMPLETED', updated_at = (extract(epoch from now()) * 1000)::bigint 
    WHERE id = p_order_id;

    -- EXPIRE TRACKING - Set to NULL when user confirms
    UPDATE public.orders SET tracking_number = NULL WHERE id = p_order_id;

    -- Create notification
    v_notification_id := 'NOTIF-' || floor(random() * 1000000000)::text;
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        v_notification_id, 
        p_user_id, 
        'Order Completed', 
        'Thank you! Order ' || p_order_id || ' is complete. Tracking expired.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.user_confirm_delivery(TEXT, TEXT) TO anon, authenticated, service_role;

-- Verify
SELECT 'Confirm delivery function fixed!' as status;
