-- Create table for loan transactions
CREATE TABLE public.loan_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('intrare', 'iesire')),
  amount numeric NOT NULL,
  description text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loan_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view loan transactions" 
ON public.loan_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create loan transactions" 
ON public.loan_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Financial records are immutable - no deletes on loan transactions" 
ON public.loan_transactions 
FOR DELETE 
USING (false);

-- Create index for better performance
CREATE INDEX idx_loan_transactions_timestamp ON public.loan_transactions(timestamp DESC);