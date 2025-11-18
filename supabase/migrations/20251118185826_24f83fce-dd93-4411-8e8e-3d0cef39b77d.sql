-- Modify soferi_pelicanul table structure to match Google Sheets import
-- Add status column and make non-essential columns nullable

-- Add status column
ALTER TABLE soferi_pelicanul ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '';

-- Make non-essential columns nullable that were required before
ALTER TABLE soferi_pelicanul ALTER COLUMN numar_contract DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN data_contract DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN cui DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN nr_inreg_onrc DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN sediu_societate DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN localitate DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN aut_taxi DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN aut_transp DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN marca_auto DROP NOT NULL;
ALTER TABLE soferi_pelicanul ALTER COLUMN serie_sasiu DROP NOT NULL;

-- Set default empty strings for nullable text columns
ALTER TABLE soferi_pelicanul ALTER COLUMN numar_contract SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN cui SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN nr_inreg_onrc SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN sediu_societate SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN localitate SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN aut_taxi SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN aut_transp SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN marca_auto SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN serie_sasiu SET DEFAULT '';
ALTER TABLE soferi_pelicanul ALTER COLUMN data_contract SET DEFAULT '2024-01-01';