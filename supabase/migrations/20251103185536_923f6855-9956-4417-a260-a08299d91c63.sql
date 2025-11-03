-- Create table for DRINK OK orders
CREATE TABLE public.drink_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  data_ora timestamp with time zone NOT NULL DEFAULT now(),
  nume_client text NOT NULL,
  telefon_client text NOT NULL,
  adresa_preluare text NOT NULL,
  adresa_destinatie text NOT NULL,
  marca_auto text NOT NULL,
  indicativ text NOT NULL,
  timp_estimat text NOT NULL,
  status text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drink_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view drink orders"
ON public.drink_orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert drink orders"
ON public.drink_orders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update drink orders"
ON public.drink_orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete drink orders"
ON public.drink_orders
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_drink_orders_updated_at
BEFORE UPDATE ON public.drink_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();