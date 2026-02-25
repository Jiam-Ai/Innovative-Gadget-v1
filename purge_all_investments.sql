
-- PURGE ALL INVESTMENT SYSTEM DATA AND STRUCTURES
-- This script transitions the database to a pure E-Commerce marketplace.

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
DROP FUNCTION IF EXISTS public.invest_in_epoch(TEXT, TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.purchase_bond(TEXT, TEXT, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.inject_pool_liquidity(TEXT, TEXT, NUMERIC) CASCADE;

-- 3. Clean up any investment-related transactions
DELETE FROM public.transactions WHERE type = 'EARNING';

-- 4. Final verification of ecommerce tables
-- Ensure products, orders, cart_items, wishlist, transactions (ecommerce types), notifications, and users remain.
