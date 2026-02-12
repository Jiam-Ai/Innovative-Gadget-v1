
-- INNOVATIVE GADGET E-COMMERCE CORE SCHEMA
-- This script ensures tables are created in the correct dependency order.

-- 1. Identity Layer (Must be first)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    verification_code TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    registered_at BIGINT NOT NULL,
    withdrawal_account TEXT,
    invited_by TEXT
);

-- 2. Product Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Gadgets',
    stock_quantity INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at BIGINT NOT NULL
);

-- 3. Orders and Tracking
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, SHIPPED, DELIVERED, COMPLETED
    tracking_number TEXT,
    shipping_details TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 4. Financial Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id),
    user_phone TEXT NOT NULL,
    type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'PURCHASE', 'REFUND'
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'
    date BIGINT NOT NULL,
    reference_id TEXT,
    method TEXT,
    details TEXT
);

-- 5. Notification System
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date BIGINT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info'
);

-- 6. Atomic Stored Procedures (RPCs)
-- This function handles the purchase, balance deduction, and order creation in one transaction.

CREATE OR REPLACE FUNCTION public.atomic_purchase_gadget(
    p_user_id TEXT,
    p_product_id UUID,
    p_amount NUMERIC,
    p_shipping TEXT
) RETURNS VOID AS $$
DECLARE
    v_order_id TEXT;
    v_user_phone TEXT;
BEGIN
    -- Check Balance
    IF (SELECT balance FROM public.users WHERE id = p_user_id) < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet liquidity';
    END IF;

    -- Get User Phone for Ledger
    SELECT phone INTO v_user_phone FROM public.users WHERE id = p_user_id;

    -- Generate Order ID
    v_order_id := 'ORD-' || floor(random()*1000000)::text;

    -- Deduct Balance
    UPDATE public.users SET balance = balance - p_amount WHERE id = p_user_id;

    -- Create Order
    INSERT INTO public.orders (id, user_id, product_id, total_price, status, shipping_details, created_at, updated_at)
    VALUES (
        v_order_id, 
        p_user_id, 
        p_product_id, 
        p_amount, 
        'PENDING', 
        p_shipping, 
        (extract(epoch from now()) * 1000)::bigint, 
        (extract(epoch from now()) * 1000)::bigint
    );

    -- Log Transaction
    INSERT INTO public.transactions (id, user_id, user_phone, type, amount, status, date, details)
    VALUES (
        'TX-' || v_order_id, 
        p_user_id, 
        v_user_phone, 
        'PURCHASE', 
        p_amount, 
        'COMPLETED', 
        (extract(epoch from now()) * 1000)::bigint, 
        'Gadget Purchase: ' || v_order_id
    );

    -- Notify Admin
    INSERT INTO public.notifications (id, user_id, title, message, date, type)
    SELECT 
        'NT-' || v_order_id || '-' || u.id, 
        u.id, 
        'New Order Received', 
        'A new order ' || v_order_id || ' requires fulfillment.', 
        (extract(epoch from now()) * 1000)::bigint, 
        'info'
    FROM public.users u WHERE u.is_admin = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Admin Seed (Phone: 076000000, Pass: admin123)
INSERT INTO public.users (id, phone, password, balance, verification_code, is_admin, registered_at)
VALUES ('admin-node', '076000000', 'admin123', 999999, 'IG-ROOT', TRUE, (extract(epoch from now()) * 1000)::bigint)
ON CONFLICT DO NOTHING;
