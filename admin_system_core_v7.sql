
-- INNOVATIVE GADGET: ADMINISTRATIVE CORE PROTOCOL V7
-- SYSTEM: RETAIL & LOGISTICS MANAGEMENT

-- 1. LOGISTICS: SHIP ORDER PROTOCOL
CREATE OR REPLACE FUNCTION public.admin_ship_order_protocol(
    p_order_id TEXT,
    p_tracking_number TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_prod_name TEXT;
BEGIN
    -- Check order existence
    SELECT user_id, (SELECT name FROM products WHERE id = o.product_id) INTO v_user_id, v_prod_name
    FROM public.orders o WHERE id = p_order_id;

    -- Update Status
    UPDATE public.orders 
    SET 
        status = 'SHIPPED', 
        tracking_number = p_tracking_number,
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    -- Notify User
    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        v_user_id, 
        'Package Shipped', 
        'Your gadget "' || v_prod_name || '" is on the move. Tracking: ' || p_tracking_number, 
        (extract(epoch from now()) * 1000)::bigint, 
        'info'
    );
END;
$$ LANGUAGE plpgsql;

-- 2. LOGISTICS: DELIVER ORDER PROTOCOL
CREATE OR REPLACE FUNCTION public.admin_deliver_order_protocol(
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    SELECT user_id INTO v_user_id FROM public.orders WHERE id = p_order_id;

    UPDATE public.orders 
    SET 
        status = 'DELIVERED', 
        updated_at = (extract(epoch from now()) * 1000)::bigint
    WHERE id = p_order_id;

    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        v_user_id, 
        'Package Arrived', 
        'Your order ' || p_order_id || ' has reached its destination hub. Please confirm receipt in the app.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'success'
    );
END;
$$ LANGUAGE plpgsql;

-- 3. FINANCIAL: MANUAL BALANCE ADJUSTMENT
CREATE OR REPLACE FUNCTION public.admin_adjust_user_balance(
    p_user_id TEXT,
    p_new_balance NUMERIC,
    p_reason TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET balance = p_new_balance 
    WHERE id = p_user_id;

    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        p_user_id, 
        'Balance Adjustment', 
        'Admin modified your vault liquidity. Reason: ' || p_reason, 
        (extract(epoch from now()) * 1000)::bigint, 
        'warning'
    );
END;
$$ LANGUAGE plpgsql;

-- 4. INVENTORY: MANAGE STOCK LEVELS
CREATE OR REPLACE FUNCTION public.admin_manage_inventory(
    p_product_id UUID,
    p_new_stock INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE public.products 
    SET stock_quantity = p_new_stock 
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 5. LOGISTICS: CANCEL & REFUND
CREATE OR REPLACE FUNCTION public.admin_cancel_order_protocol(
    p_order_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id TEXT;
    v_amount NUMERIC;
    v_pay_method TEXT;
BEGIN
    SELECT user_id, total_price, payment_method INTO v_user_id, v_amount, v_pay_method 
    FROM public.orders WHERE id = p_order_id;

    -- If Balance was used, refund it
    IF v_pay_method = 'BALANCE' THEN
        UPDATE public.users SET balance = balance + v_amount WHERE id = v_user_id;
        
        INSERT INTO public.transactions (id, user_id, user_phone, type, amount, status, date, details)
        VALUES (
            'REF-' || p_order_id, 
            v_user_id, 
            (SELECT phone FROM public.users WHERE id = v_user_id), 
            'REFUND', 
            v_amount, 
            'COMPLETED', 
            (extract(epoch from now()) * 1000)::bigint, 
            'Refund for cancelled order: ' || p_order_id
        );
    END IF;

    -- Mark Order Cancelled
    DELETE FROM public.orders WHERE id = p_order_id;

    INSERT INTO public.notifications (user_id, title, message, date, type)
    VALUES (
        v_user_id, 
        'Order Cancelled', 
        'Your order ' || p_order_id || ' was cancelled by admin. ' || 
        CASE WHEN v_pay_method = 'BALANCE' THEN 'Funds returned to wallet.' ELSE 'COD request voided.' END, 
        (extract(epoch from now()) * 1000)::bigint, 
        'error'
    );
END;
$$ LANGUAGE plpgsql;

-- GRANTS
GRANT EXECUTE ON FUNCTION public.admin_ship_order_protocol(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_deliver_order_protocol(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_adjust_user_balance(TEXT, NUMERIC, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_manage_inventory(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order_protocol(TEXT) TO service_role;
