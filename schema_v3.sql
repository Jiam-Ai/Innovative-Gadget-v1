
-- ADVANCED LOGISTICS SYSTEM OPTIMIZATION
-- REVISION: 3.0.0

-- 1. Performance-Centric Indexing
-- Optimizes queries filtering by status and date for specific users
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date ON public.orders(user_id, status, created_at DESC);
-- Ensures tracking searches remain O(1)
CREATE INDEX IF NOT EXISTS idx_orders_tracking_secure ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- 2. Enhanced Atomic Lifecycle RPC
-- This handles delivery confirmation with built-in validation
CREATE OR REPLACE FUNCTION public.user_confirm_order_delivery(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
BEGIN
    -- Verify ownership and state before updating
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id AND user_id = p_user_id 
        AND status IN ('SHIPPED', 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Order is not in a confirmable state or unauthorized';
    END IF;

    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id AND user_id = p_user_id;

    -- Generate notification for confirmation
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        p_user_id, 
        'Delivery Confirmed', 
        'Order ' || p_order_id || ' has been marked as completed. Thank you for shopping!', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;
