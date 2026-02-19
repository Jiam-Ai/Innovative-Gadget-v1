
-- RETAIL FINALIZATION PROTOCOL
-- SQL for securing order data and tracking

-- 1. Create a function to atomically finalize a sale
CREATE OR REPLACE FUNCTION public.finalize_gadget_delivery_v2(
    p_order_id TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE public.orders 
    SET 
        status = 'COMPLETED',
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Pure E-Commerce View
CREATE OR REPLACE VIEW public.active_retail_shipments AS
SELECT 
    o.id, 
    o.tracking_number, 
    o.status, 
    o.updated_at,
    p.name as gadget_name
FROM public.orders o
JOIN public.products p ON o.product_id = p.id
WHERE o.status != 'COMPLETED' 
  AND o.tracking_number IS NOT NULL;
