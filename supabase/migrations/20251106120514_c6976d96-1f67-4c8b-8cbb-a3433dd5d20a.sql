-- Create table for PELICANUL AST drivers
CREATE TABLE public.soferi_pelicanul_ast (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numar_contract text NOT NULL,
  data_contract date NOT NULL,
  indicativ_alocat text NOT NULL,
  denumire_societate text NOT NULL,
  cui text NOT NULL,
  nr_inreg_onrc text NOT NULL,
  sediu_societate text NOT NULL,
  localitate text NOT NULL,
  administrator text NOT NULL,
  telefon_administrator text NOT NULL,
  aut_taxi text NOT NULL,
  aut_transp text NOT NULL,
  marca_auto text NOT NULL,
  numar_auto text NOT NULL,
  serie_sasiu text NOT NULL,
  nume_sofer text NOT NULL,
  telefon_sofer text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.soferi_pelicanul_ast ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view drivers"
ON public.soferi_pelicanul_ast
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert drivers"
ON public.soferi_pelicanul_ast
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update drivers"
ON public.soferi_pelicanul_ast
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete drivers"
ON public.soferi_pelicanul_ast
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_soferi_pelicanul_ast_updated_at
BEFORE UPDATE ON public.soferi_pelicanul_ast
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();