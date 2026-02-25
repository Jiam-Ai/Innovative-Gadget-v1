
-- PURGE INVESTMENT SYSTEM
-- This script removes all tables, functions, and triggers related to investment features.
-- It transitions the database to a pure E-Commerce marketplace.

-- 1. Drop Investment Tables
DROP TABLE IF EXISTS public.user_epoch_investments CASCADE;
DROP TABLE IF EXISTS public.training_epochs CASCADE;
DROP TABLE IF EXISTS public.user_bonds CASCADE;
DROP TABLE IF EXISTS public.bond_templates CASCADE;
DROP TABLE IF EXISTS public.user_stakes CASCADE;
DROP TABLE IF EXISTS public.staking_pools CASCADE;
DROP TABLE IF EXISTS public.user_products CASCADE;

-- 2. Drop Investment Functions
DROP FUNCTION IF EXISTS public.process_automatic_earnings() CASCADE;

-- 3. Clean up Users table (Optional: keep loyalty but remove investment specific fields if any)
-- Currently users table has loyalty_points and member_level which are fine for e-commerce.

-- 4. Ensure RLS is still correct for e-commerce tables
-- (This was handled in auth_logic_integration.sql)

-- 5. Fix potential syntax errors in other scripts
-- The error "syntax error at end of input" often comes from an empty script or a script ending with a semicolon but no statement.
-- We will ensure all our scripts are well-formed.
