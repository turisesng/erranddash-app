-- Fix the function search path issue for security
CREATE OR REPLACE FUNCTION public.log_store_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access attempts for security monitoring
  -- In a production environment, you might want to log this to a separate audit table
  -- For now, we'll keep it simple but this provides the foundation for monitoring
  RAISE LOG 'Store contact accessed: user_id=%, store_id=%', auth.uid(), NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;