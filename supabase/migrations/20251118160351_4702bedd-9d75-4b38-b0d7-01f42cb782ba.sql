-- Add register_type field to distinguish between CASA and DMX registers
ALTER TABLE public.shifts
ADD COLUMN register_type text NOT NULL DEFAULT 'CASA';

ALTER TABLE public.transactions
ADD COLUMN register_type text NOT NULL DEFAULT 'CASA';

-- Add index for better query performance
CREATE INDEX idx_shifts_register_type ON public.shifts(register_type);
CREATE INDEX idx_transactions_register_type ON public.transactions(register_type);