
-- DELIVERY FINALIZATION PROTOCOL
-- Ensure that tracking numbers are restricted to active orders only

-- Function to handle atomic receipt confirmation
CREATE OR REPLACE FUNCTION public.confirm_order_delivery(
    p_order_id TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Optional: Clear the tracking number physically if strict invalidation is required
    -- UPDATE public.orders SET tracking_number = NULL WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- View to filter out "zombie" tracking IDs for the public search
-- In the app code, we already filter by status, but this serves as a DB layer safeguard.
CREATE OR REPLACE VIEW public.active_trackable_orders AS
SELECT * FROM public.orders 
WHERE status NOT IN ('COMPLETED');
