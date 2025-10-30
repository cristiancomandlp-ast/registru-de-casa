-- Update RLS policies for necesar table to allow authenticated users to insert and update

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert necesar" ON public.necesar;
DROP POLICY IF EXISTS "Admins can update necesar" ON public.necesar;

-- Create new policies that allow all authenticated users to insert and update
CREATE POLICY "Authenticated users can insert necesar" 
ON public.necesar 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update necesar" 
ON public.necesar 
FOR UPDATE 
TO authenticated
USING (true);