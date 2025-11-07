-- Add display_name column to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN display_name TEXT NOT NULL DEFAULT 'Utilizator';

-- Update existing messages to use display_name instead of email
UPDATE public.chat_messages 
SET display_name = user_email 
WHERE display_name = 'Utilizator';