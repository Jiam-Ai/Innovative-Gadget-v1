
-- FIX: Notifications table - Add default value for id column
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT 'NT-' || floor(random()*1000000)::text;

-- Also ensure the orders table has the required columns for the app to work
-- Run this to verify/add missing columns to orders table
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method TEXT DEFAULT 'COD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'receiver_name') THEN
        ALTER TABLE public.orders ADD COLUMN receiver_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'receiver_phone') THEN
        ALTER TABLE public.orders ADD COLUMN receiver_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_address TEXT;
    END IF;
END $$;

-- Verify the function exists
SELECT proname FROM pg_proc WHERE proname = 'admin_update_order_status_v8';
