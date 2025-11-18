-- Create table for reclamatii (complaints)
CREATE TABLE public.reclamatii (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nume_complet text NOT NULL,
  telefon text NOT NULL,
  email text,
  tip_reclamatie text NOT NULL,
  numar_taxi text NOT NULL,
  data_incident date NOT NULL,
  ora_incident time NOT NULL,
  descriere text NOT NULL,
  status text NOT NULL DEFAULT 'In asteptare',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reclamatii ENABLE ROW LEVEL SECURITY;

-- Create policies for reclamatii
CREATE POLICY "Authenticated users can view all complaints"
ON public.reclamatii
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert complaints"
ON public.reclamatii
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update complaints"
ON public.reclamatii
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete complaints"
ON public.reclamatii
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reclamatii_updated_at
BEFORE UPDATE ON public.reclamatii
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();