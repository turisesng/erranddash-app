-- Fix overly permissive store_contacts RLS policy
-- Remove the current policy that allows all authenticated users to view all store contacts
DROP POLICY IF EXISTS "Authenticated users can view store contacts" ON public.store_contacts;

-- Create a more restrictive policy that only allows users to view store contacts 
-- for stores they have legitimate business with (have placed orders)
CREATE POLICY "Users can view contacts for stores they have ordered from" 
ON public.store_contacts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.store_id = store_contacts.store_id 
    AND orders.user_id = auth.uid()
  )
);

-- Also allow users to view store contacts when they are actively viewing a store
-- This is necessary for the store profile page functionality
CREATE POLICY "Users can view contacts for individual store lookups" 
ON public.store_contacts 
FOR SELECT 
TO authenticated
USING (true);

-- Actually, let's replace the above with a more secure approach
-- Drop the overly broad policy
DROP POLICY IF EXISTS "Users can view contacts for individual store lookups" ON public.store_contacts;

-- Create a policy that limits access but still allows legitimate use
-- This allows viewing contacts but with user-level restrictions that prevent bulk harvesting
CREATE POLICY "Limited store contact access" 
ON public.store_contacts 
FOR SELECT 
TO authenticated
USING (
  -- Allow access to contacts for stores the user has orders with
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.store_id = store_contacts.store_id 
    AND orders.user_id = auth.uid()
  )
  OR
  -- Allow access to contacts for active stores (but this could still be harvested)
  -- For now, let's be more restrictive and require some legitimate interaction
  EXISTS (
    SELECT 1 FROM public.chat_messages 
    WHERE chat_messages.store_id = store_contacts.store_id 
    AND chat_messages.user_id = auth.uid()
  )
);