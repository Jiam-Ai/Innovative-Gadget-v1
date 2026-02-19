
-- RETAIL PURGE 2024
-- Removes all legacy investment infrastructure

DROP TABLE IF EXISTS public.user_stakes CASCADE;
DROP TABLE IF EXISTS public.staking_pools CASCADE;
DROP TABLE IF EXISTS public.user_bonds CASCADE;
DROP TABLE IF EXISTS public.bond_templates CASCADE;
DROP TABLE IF EXISTS public.user_epoch_investments CASCADE;
DROP TABLE IF EXISTS public.training_epochs CASCADE;
DROP TABLE IF EXISTS public.user_products CASCADE;

DROP FUNCTION IF EXISTS public.process_daily_earnings();
DROP FUNCTION IF EXISTS public.inject_staking_liquidity(TEXT, TEXT, NUMERIC);
DROP FUNCTION IF EXISTS public.purchase_bond(TEXT, TEXT, NUMERIC);
DROP FUNCTION IF EXISTS public.invest_in_epoch(TEXT, TEXT, NUMERIC);

-- Re-labeling financial ledger
COMMENT ON TABLE public.transactions IS 'Sales and credit ledger for retail hardware store.';
