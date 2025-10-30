-- Drop the existing pontaj table and recreate with new structure
DROP TABLE IF EXISTS public.pontaj;

-- Create new pontaj table with vertical structure
CREATE TABLE public.pontaj (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data date NOT NULL UNIQUE,
  tura_zi text,
  tura_noapte text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pontaj ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view pontaj"
ON public.pontaj
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert pontaj"
ON public.pontaj
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pontaj"
ON public.pontaj
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pontaj"
ON public.pontaj
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pontaj_updated_at
BEFORE UPDATE ON public.pontaj
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();