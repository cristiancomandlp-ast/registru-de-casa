-- Create table for ȘOFERI PELICANUL
CREATE TABLE public.soferi_pelicanul (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numar_contract TEXT NOT NULL,
  data_contract DATE NOT NULL,
  indicativ_alocat TEXT NOT NULL,
  denumire_societate TEXT NOT NULL,
  cui TEXT NOT NULL,
  nr_inreg_onrc TEXT NOT NULL,
  sediu_societate TEXT NOT NULL,
  localitate TEXT NOT NULL,
  administrator TEXT NOT NULL,
  telefon_administrator TEXT NOT NULL,
  aut_taxi TEXT NOT NULL,
  aut_transp TEXT NOT NULL,
  marca_auto TEXT NOT NULL,
  numar_auto TEXT NOT NULL,
  serie_sasiu TEXT NOT NULL,
  nume_sofer TEXT NOT NULL,
  telefon_sofer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.soferi_pelicanul ENABLE ROW LEVEL SECURITY;

-- Create policies for soferi_pelicanul
CREATE POLICY "Everyone can view drivers" 
ON public.soferi_pelicanul 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert drivers" 
ON public.soferi_pelicanul 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update drivers" 
ON public.soferi_pelicanul 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete drivers" 
ON public.soferi_pelicanul 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_soferi_pelicanul_updated_at
BEFORE UPDATE ON public.soferi_pelicanul
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();