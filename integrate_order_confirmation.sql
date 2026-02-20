
-- INTEGRATE ORDER CONFIRMATION PROTOCOL
-- FUNCTION: user_confirm_order_delivery_v2
-- DESCRIPTION: Allows a user to mark their order as COMPLETED after receiving the physical package.

CREATE OR REPLACE FUNCTION public.user_confirm_order_delivery_v2(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_now BIGINT;
BEGIN
    -- Set current timestamp in milliseconds
    v_now := (extract(epoch from now()) * 1000)::bigint;

    -- 1. SECURITY & STATE VALIDATION
    -- We only allow confirmation if the order belongs to the calling user
    -- AND the current status is either SHIPPED or DELIVERED.
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id 
          AND user_id = p_user_id 
          AND status IN ('SHIPPED', 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Protocol Denied: Order is not in a confirmable state or unauthorized access detected.';
    END IF;

    -- 2. UPDATE ORDER LIFECYCLE
    -- Transition the hardware request to the final 'COMPLETED' state.
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = v_now
    WHERE id = p_order_id;

    -- 3. NOTIFICATION LOGGING
    -- Log a success message in the user's notification feed.
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    VALUES (
        'NT-CONF-' || p_order_id || '-' || v_now,
        p_user_id, 
        'Order Received', 
        'Package for order ' || p_order_id || ' has been successfully finalized and confirmed by you.', 
        v_now, 
        'success'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 4. LOYALTY UPDATES (Optional Hook)
    -- If there's a loyalty trigger (like in database_features_v6.sql), 
    -- it will automatically fire after this status update.

END;
$$ LANGUAGE plpgsql;

-- Grant execution permissions
ALTER FUNCTION public.user_confirm_order_delivery_v2(TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.user_confirm_order_delivery_v2(TEXT, TEXT) TO anon, authenticated, service_role;
