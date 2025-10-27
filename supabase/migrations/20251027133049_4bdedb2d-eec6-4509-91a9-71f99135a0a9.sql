-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Toată lumea poate vizualiza turele" ON public.shifts;
DROP POLICY IF EXISTS "Toată lumea poate crea ture" ON public.shifts;
DROP POLICY IF EXISTS "Toată lumea poate actualiza turele" ON public.shifts;
DROP POLICY IF EXISTS "Toată lumea poate vizualiza tranzacțiile" ON public.transactions;
DROP POLICY IF EXISTS "Toată lumea poate crea tranzacții" ON public.transactions;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can view shifts" 
  ON public.shifts FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create shifts" 
  ON public.shifts FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shifts" 
  ON public.shifts FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view transactions" 
  ON public.transactions FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create transactions" 
  ON public.transactions FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Add explicit DELETE policies (financial records should be immutable)
CREATE POLICY "Financial records are immutable - no deletes on shifts" 
  ON public.shifts FOR DELETE 
  TO authenticated
  USING (false);

CREATE POLICY "Financial records are immutable - no deletes on transactions" 
  ON public.transactions FOR DELETE 
  TO authenticated
  USING (false);

-- Add CHECK constraints for input validation
-- Transaction constraints
ALTER TABLE public.transactions 
ADD CONSTRAINT amount_positive CHECK (amount > 0),
ADD CONSTRAINT amount_reasonable CHECK (amount <= 100000),
ADD CONSTRAINT description_not_empty CHECK (char_length(trim(description)) > 0),
ADD CONSTRAINT description_length CHECK (char_length(description) <= 200);

-- Shift constraints
ALTER TABLE public.shifts
ADD CONSTRAINT balance_non_negative CHECK (initial_balance >= 0 AND final_balance >= 0),
ADD CONSTRAINT balance_reasonable CHECK (initial_balance <= 1000000 AND final_balance <= 1000000),
ADD CONSTRAINT dispatcher_valid CHECK (
  dispatcher IN ('Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta')
);