
-- 1. Ensure Notifications table exists with correct schema
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT 'NT-' || floor(random()*1000000)::text,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date BIGINT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'info' -- 'info', 'success', 'warning', 'error'
);

-- 2. Enable Realtime for the notifications table
-- This allows the frontend to listen for "INSERT" events via WebSockets
begin;
  -- remove the table from realtime if it exists to avoid errors
  alter publication supabase_realtime q1 drop table if exists public.notifications;
  -- add it to the publication
  alter publication supabase_realtime add table public.notifications;
commit;

-- 3. Add RLS for security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);
