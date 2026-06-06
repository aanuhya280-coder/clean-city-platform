-- Allow all authenticated users to read profile names (public transparency)
CREATE POLICY "select_public_names" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to read profile names (for public feed/map)
CREATE POLICY "select_public_names_anon" ON public.profiles
  FOR SELECT
  TO anon
  USING (true);