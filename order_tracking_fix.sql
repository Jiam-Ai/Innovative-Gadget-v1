
-- ORDER TRACKING SYSTEM OPTIMIZATION
-- REVISION: 2.1.0

-- 1. Indexing for High-Performance Lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- 2. Enhanced Atomic Checkout Function
-- This handles multiple items, balance deduction, and notification logic.
CREATE OR REPLACE FUNCTION public.atomic_cart_checkout(
    p_user_id TEXT,
    p_total_amount NUMERIC,
    p_payment_method TEXT,
    p_receiver_name TEXT,
    p_receiver_phone TEXT,
    p_address TEXT,
    p_tracking_id TEXT
) RETURNS VOID AS $$
DECLARE
    cart_record RECORD;
    v_now BIGINT;
BEGIN
    v_now := (extract(epoch from now()) * 1000)::bigint;

    -- Validate Liquidity for Balance Payments
    IF p_payment_method = 'BALANCE' THEN
        IF (SELECT balance FROM public.users WHERE id = p_user_id) < p_total_amount THEN
            RAISE EXCEPTION 'Insufficient vault liquidity';
        END IF;
        
        -- Deduct from user
        UPDATE public.users SET balance = balance - p_total_amount WHERE id = p_user_id;
        
        -- Log Transaction
        INSERT INTO public.transactions (id, user_id, user_phone, type, amount, status, date, reference_id, method, details)
        VALUES (
            'TX-' || p_tracking_id, 
            p_user_id, 
            (SELECT phone FROM public.users WHERE id = p_user_id),
            'PURCHASE', 
            p_total_amount, 
            'COMPLETED', 
            v_now, 
            p_tracking_id, 
            p_payment_method, 
            'Checkout for tracking ' || p_tracking_id
        );
    END IF;

    -- Move items from cart_items to orders
    FOR cart_record IN SELECT * FROM public.cart_items WHERE user_id = p_user_id LOOP
        INSERT INTO public.orders (
            id, 
            user_id, 
            product_id, 
            quantity, 
            total_price, 
            status, 
            tracking_number, 
            shipping_details, 
            created_at, 
            updated_at
        ) VALUES (
            'ORD-' || floor(random()*1000000)::text,
            p_user_id,
            cart_record.product_id,
            cart_record.quantity,
            (SELECT price FROM public.products WHERE id = cart_record.product_id) * cart_record.quantity,
            'PENDING',
            p_tracking_id,
            p_receiver_name || ' | ' || p_receiver_phone || ' | ' || p_address,
            v_now,
            v_now
        );
    END LOOP;

    -- Clear User Cart
    DELETE FROM public.cart_items WHERE user_id = p_user_id;

END;
$$ LANGUAGE plpgsql;
