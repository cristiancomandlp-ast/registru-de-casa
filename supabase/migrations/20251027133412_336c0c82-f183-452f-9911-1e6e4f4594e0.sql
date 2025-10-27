-- Add CHECK constraints for input validation using DO blocks
DO $$ 
BEGIN
  -- Transaction constraints
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'amount_positive'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT amount_positive CHECK (amount > 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'amount_reasonable'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT amount_reasonable CHECK (amount <= 100000);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'description_not_empty'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT description_not_empty CHECK (char_length(trim(description)) > 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'description_length'
  ) THEN
    ALTER TABLE public.transactions ADD CONSTRAINT description_length CHECK (char_length(description) <= 200);
  END IF;

  -- Shift constraints
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'balance_non_negative'
  ) THEN
    ALTER TABLE public.shifts ADD CONSTRAINT balance_non_negative CHECK (initial_balance >= 0 AND final_balance >= 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'balance_reasonable'
  ) THEN
    ALTER TABLE public.shifts ADD CONSTRAINT balance_reasonable CHECK (initial_balance <= 1000000 AND final_balance <= 1000000);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dispatcher_valid'
  ) THEN
    ALTER TABLE public.shifts ADD CONSTRAINT dispatcher_valid CHECK (dispatcher IN ('Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta'));
  END IF;

  -- Add DELETE policies (financial records should be immutable)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shifts' 
    AND policyname = 'Financial records are immutable - no deletes on shifts'
  ) THEN
    EXECUTE 'CREATE POLICY "Financial records are immutable - no deletes on shifts" ON public.shifts FOR DELETE TO authenticated USING (false)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Financial records are immutable - no deletes on transactions'
  ) THEN
    EXECUTE 'CREATE POLICY "Financial records are immutable - no deletes on transactions" ON public.transactions FOR DELETE TO authenticated USING (false)';
  END IF;
END $$;