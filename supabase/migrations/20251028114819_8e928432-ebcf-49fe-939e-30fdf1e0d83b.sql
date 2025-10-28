-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create pontaj table
CREATE TABLE public.pontaj (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatcher TEXT NOT NULL CHECK (dispatcher IN ('Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta')),
  data DATE NOT NULL,
  ore_lucrate NUMERIC NOT NULL DEFAULT 0,
  observatii TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (dispatcher, data)
);

-- Enable RLS on pontaj
ALTER TABLE public.pontaj ENABLE ROW LEVEL SECURITY;

-- RLS policies for pontaj
CREATE POLICY "Everyone can view pontaj"
  ON public.pontaj
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert pontaj"
  ON public.pontaj
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pontaj"
  ON public.pontaj
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pontaj"
  ON public.pontaj
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create necesar table
CREATE TABLE public.necesar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nume_produs TEXT NOT NULL,
  cantitate TEXT NOT NULL,
  luna_an TEXT NOT NULL,
  observatii TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on necesar
ALTER TABLE public.necesar ENABLE ROW LEVEL SECURITY;

-- RLS policies for necesar
CREATE POLICY "Everyone can view necesar"
  ON public.necesar
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert necesar"
  ON public.necesar
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update necesar"
  ON public.necesar
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete necesar"
  ON public.necesar
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_pontaj_updated_at
  BEFORE UPDATE ON public.pontaj
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_necesar_updated_at
  BEFORE UPDATE ON public.necesar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();