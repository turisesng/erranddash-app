-- Create a secure store contacts table for sensitive information
CREATE TABLE public.store_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  phone text,
  email text,
  contact_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on store_contacts (only authenticated users can access)
ALTER TABLE public.store_contacts ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view store contact information
CREATE POLICY "Authenticated users can view store contacts"
ON public.store_contacts
FOR SELECT
TO authenticated
USING (true);

-- Migrate existing contact data to the new table
INSERT INTO public.store_contacts (store_id, phone, email, contact_info)
SELECT id, phone, email, contact_info
FROM public.stores
WHERE phone IS NOT NULL OR email IS NOT NULL OR contact_info IS NOT NULL;

-- Remove sensitive contact information from public stores table
ALTER TABLE public.stores DROP COLUMN IF EXISTS phone;
ALTER TABLE public.stores DROP COLUMN IF EXISTS email; 
ALTER TABLE public.stores DROP COLUMN IF EXISTS contact_info;

-- Update the stores RLS policy to be more restrictive for any remaining sensitive data
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON public.stores;

-- Create new policy that allows public access to basic store info only
CREATE POLICY "Public store information is viewable by everyone"
ON public.stores
FOR SELECT
USING (true);

-- Add trigger for updating timestamps on store_contacts
CREATE TRIGGER update_store_contacts_updated_at
BEFORE UPDATE ON public.store_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();