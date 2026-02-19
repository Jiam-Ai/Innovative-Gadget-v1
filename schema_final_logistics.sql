
-- INNOVATIVE GADGET: FINAL LOGISTICS PROTOCOL
-- REVISION 5.1.0

-- 1. Performance Composite Indexing
-- Optimizes history/ledger queries for sub-10ms response times
CREATE INDEX IF NOT EXISTS idx_orders_user_lifecycle ON public.orders(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_fast_lookup ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- 2. Atomic Logistics Confirmation RPC
-- Handles order finalization, timestamping, and user notification in one block
CREATE OR REPLACE FUNCTION public.user_confirm_order_delivery_v3(
    p_user_id TEXT,
    p_order_id TEXT
) RETURNS VOID AS $$
BEGIN
    -- Validation: Check ownership and state
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id AND user_id = p_user_id 
        AND status IN ('SHIPPED', 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Protocol Error: Order not in confirmable state or unauthorized access';
    END IF;

    -- Execute Transition
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id AND user_id = p_user_id;

    -- Push Notification to User Node
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        p_user_id, 
        'Hardware Finalized', 
        'Success! Your order ' || p_order_id || ' has been successfully synchronized and finalized.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;
