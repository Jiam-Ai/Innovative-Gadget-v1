
-- INNOVATIVE GADGET: LOGISTICS PROTOCOL V5
-- OPTIMIZATION & LIFECYCLE MANAGEMENT

-- 1. Performance-Centric Indexing
-- Optimizes the grid filtering by status and date range for specific users
CREATE INDEX IF NOT EXISTS idx_orders_filter_matrix ON public.orders(user_id, status, created_at DESC);
-- Ensures global tracking searches remain O(1) complexity
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id_lookup ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- 2. Atomic Order Finalization RPC
-- Ensures status updates and user notifications are perfectly synchronized
CREATE OR REPLACE FUNCTION public.user_confirm_order_delivery_v2(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
BEGIN
    -- Security Check: Verify order belongs to user and is in a confirmable state
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id AND user_id = p_user_id 
        AND status IN ('SHIPPED', 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Order not in confirmable state or unauthorized access';
    END IF;

    -- Update Order Status
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id AND user_id = p_user_id;

    -- Generate Success Notification
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        p_user_id, 
        'Protocol Finalized', 
        'Your order ' || p_order_id || ' has been successfully delivered and confirmed.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;
