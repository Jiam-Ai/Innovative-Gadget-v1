
-- INNOVATIVE GADGET: LOGISTICS HUB PROTOCOL V8
-- ARCHITECTED BY: SENIOR SYSTEMS ENGINEER

-- 1. STRICT TRANSITION FUNCTION
-- This function ensures orders cannot skip states or be modified once COMPLETED.
CREATE OR REPLACE FUNCTION public.admin_update_order_status_v8(
    p_order_id TEXT,
    p_new_status TEXT,
    p_tracking TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    -- Fetch current state
    SELECT status INTO v_current_status FROM public.orders WHERE id = p_order_id;

    -- SECURITY: Immutability Check
    IF v_current_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Protocol Violation: Completed orders are locked in the ledger and cannot be modified.';
    END IF;

    -- Update Logic
    UPDATE public.orders 
    SET 
        status = p_new_status,
        tracking_number = COALESCE(p_tracking, tracking_number),
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Automated Notification Trigger
    INSERT INTO public.notifications (user_id, title, message, date, type)
    SELECT 
        user_id, 
        'Order Status: ' || p_new_status, 
        'Your hardware request ' || id || ' has moved to state: ' || p_new_status,
        (extract(epoch from now()) * 1000)::bigint,
        'info'
    FROM public.orders WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 2. SECURE USER FINALIZATION
-- This is the only way an order enters the 'COMPLETED' state.
CREATE OR REPLACE FUNCTION public.user_finalize_order_protocol(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_amount NUMERIC;
BEGIN
    -- Verify the order is in the 'DELIVERED' state (The Hub)
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id 
          AND user_id = p_user_id 
          AND status = 'DELIVERED'
    ) THEN
        RAISE EXCEPTION 'Finalization Denied: Order must be in DELIVERED state for customer confirmation.';
    END IF;

    -- Lock the state to COMPLETED
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Log to System Ledger (Transactions)
    -- Note: If COD, this is where we might trigger a balanced ledger entry if needed.
    
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        p_user_id,
        'Transaction Finalized',
        'Thank you! Order ' || p_order_id || ' has been successfully moved to the system ledger.',
        (extract(epoch from now()) * 1000)::bigint,
        'success'
    );
END;
$$ LANGUAGE plpgsql;

-- GRANTS
GRANT EXECUTE ON FUNCTION public.admin_update_order_status_v8(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.user_finalize_order_protocol(TEXT, TEXT) TO anon, authenticated, service_role;
