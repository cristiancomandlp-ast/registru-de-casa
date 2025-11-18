-- Remove unnecessary columns from soferi_pelicanul table
ALTER TABLE public.soferi_pelicanul 
DROP COLUMN IF EXISTS numar_contract,
DROP COLUMN IF EXISTS data_contract,
DROP COLUMN IF EXISTS cui,
DROP COLUMN IF EXISTS nr_inreg_onrc,
DROP COLUMN IF EXISTS sediu_societate,
DROP COLUMN IF EXISTS localitate,
DROP COLUMN IF EXISTS aut_taxi,
DROP COLUMN IF EXISTS aut_transp,
DROP COLUMN IF EXISTS marca_auto,
DROP COLUMN IF EXISTS serie_sasiu;