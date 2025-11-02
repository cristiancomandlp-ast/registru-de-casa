-- Add UPDATE and DELETE policies for admins on loan_transactions
CREATE POLICY "Admins can update loan transactions" 
ON public.loan_transactions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete loan transactions" 
ON public.loan_transactions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop the old immutable delete policy
DROP POLICY IF EXISTS "Financial records are immutable - no deletes on loan transactions" ON public.loan_transactions;