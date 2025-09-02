-- First, let's ensure we have proper enum for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'storeOwner', 'rider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to ensure proper role management
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS userrole,
ALTER COLUMN user_role SET DEFAULT 'customer'::user_role;

-- Create rider profiles table for additional rider information
CREATE TABLE IF NOT EXISTS public.rider_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    license_number TEXT,
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    current_location JSONB DEFAULT '{}',
    phone_number TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rider_profiles
ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;

-- Create store_owner_profiles for additional store owner information
CREATE TABLE IF NOT EXISTS public.store_owner_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT,
    business_license TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on store_owner_profiles
ALTER TABLE public.store_owner_profiles ENABLE ROW LEVEL SECURITY;

-- Update orders table to include more contact and assignment details
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS store_notes TEXT,
ADD COLUMN IF NOT EXISTS rider_notes TEXT,
ADD COLUMN IF NOT EXISTS assignment_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Create RLS policies for rider_profiles
CREATE POLICY "Riders can view and update their own profile" 
ON public.rider_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can view available riders" 
ON public.rider_profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND user_role = 'storeOwner'
    )
    AND availability_status = 'available'
);

CREATE POLICY "Customers can view assigned rider details" 
ON public.rider_profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND user_role = 'customer'
    )
    AND EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.rider_id = rider_profiles.user_id 
        AND orders.user_id = auth.uid()
        AND orders.status IN ('picked_up', 'in_transit', 'delivered')
    )
);

-- Create RLS policies for store_owner_profiles
CREATE POLICY "Store owners can view and update their own profile" 
ON public.store_owner_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Riders and customers can view store owner contact when order exists" 
ON public.store_owner_profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        JOIN public.stores ON orders.store_id = stores.id
        WHERE stores.owner_id = store_owner_profiles.user_id
        AND (orders.user_id = auth.uid() OR orders.rider_id = auth.uid())
    )
);

-- Update profiles RLS policies to allow role-based contact sharing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Contact sharing for active orders" 
ON public.profiles 
FOR SELECT 
USING (
    -- Allow viewing customer profile if you're the assigned rider
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.user_id = profiles.user_id 
        AND orders.rider_id = auth.uid()
        AND orders.status IN ('picked_up', 'in_transit')
    )
    OR
    -- Allow viewing rider profile if you're the customer with active order
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.rider_id = profiles.user_id 
        AND orders.user_id = auth.uid()
        AND orders.status IN ('picked_up', 'in_transit', 'delivered')
    )
    OR
    -- Allow store owners to view customer profiles for their orders
    EXISTS (
        SELECT 1 FROM public.orders 
        JOIN public.stores ON orders.store_id = stores.id
        WHERE orders.user_id = profiles.user_id
        AND stores.owner_id = auth.uid()
    )
);

-- Update orders table RLS policies for better role-based access
DROP POLICY IF EXISTS "Riders can view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can update order status" ON public.orders;

CREATE POLICY "Enhanced order viewing policy" 
ON public.orders 
FOR SELECT 
USING (
    -- Users can see their own orders
    auth.uid() = user_id 
    OR 
    -- Riders can see their assigned orders
    auth.uid() = rider_id 
    OR 
    -- Store owners can see orders for their stores
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = orders.store_id 
        AND stores.owner_id = auth.uid()
    )
    OR
    -- Store owners (any) can see unassigned orders for assignment
    (
        rider_id IS NULL 
        AND status IN ('accepted', 'packed', 'ready_for_pickup')
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND user_role = 'storeOwner'
        )
    )
);

CREATE POLICY "Enhanced order update policy" 
ON public.orders 
FOR UPDATE 
USING (
    -- Users can update their own orders (limited fields)
    auth.uid() = user_id 
    OR 
    -- Riders can update assigned orders
    auth.uid() = rider_id 
    OR 
    -- Store owners can update orders for their stores
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = orders.store_id 
        AND stores.owner_id = auth.uid()
    )
    OR
    -- Store owners can assign riders to orders
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND user_role = 'storeOwner'
    )
);

-- Create function to assign riders to orders
CREATE OR REPLACE FUNCTION public.assign_rider_to_order(
    order_id UUID,
    rider_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_role user_role;
BEGIN
    -- Check if current user is a store owner
    SELECT user_role INTO current_user_role
    FROM public.profiles
    WHERE user_id = auth.uid();
    
    IF current_user_role != 'storeOwner' THEN
        RAISE EXCEPTION 'Only store owners can assign riders';
    END IF;
    
    -- Check if rider exists and is available
    IF NOT EXISTS (
        SELECT 1 FROM public.rider_profiles 
        WHERE user_id = rider_user_id 
        AND availability_status = 'available'
    ) THEN
        RAISE EXCEPTION 'Rider not available';
    END IF;
    
    -- Assign rider to order
    UPDATE public.orders 
    SET 
        rider_id = rider_user_id,
        assignment_requested_at = now(),
        updated_at = now()
    WHERE id = order_id
    AND status IN ('accepted', 'packed', 'ready_for_pickup');
    
    -- Update rider status
    UPDATE public.rider_profiles 
    SET availability_status = 'busy'
    WHERE user_id = rider_user_id;
    
    RETURN TRUE;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_rider_profiles_updated_at
    BEFORE UPDATE ON public.rider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_owner_profiles_updated_at
    BEFORE UPDATE ON public.store_owner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for stores if not exists
INSERT INTO public.stores (name, description, category, address, hours, owner_id)
SELECT 
    'DoorDash Express Store',
    'Quick delivery store for all your needs',
    'grocery',
    '123 Main Street, City Center',
    '{"monday": "9:00 AM - 9:00 PM", "tuesday": "9:00 AM - 9:00 PM", "wednesday": "9:00 AM - 9:00 PM", "thursday": "9:00 AM - 9:00 PM", "friday": "9:00 AM - 10:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "10:00 AM - 8:00 PM"}'::jsonb,
    (SELECT user_id FROM public.profiles WHERE user_role = 'storeOwner' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.stores LIMIT 1)
AND EXISTS (SELECT 1 FROM public.profiles WHERE user_role = 'storeOwner');

-- Insert corresponding store contact if store was created
INSERT INTO public.store_contacts (store_id, phone, email, contact_info)
SELECT 
    s.id,
    '+1-555-STORE',
    'store@doordash.com',
    '{"whatsapp": "+1-555-STORE", "business_hours": "9 AM - 9 PM"}'::jsonb
FROM public.stores s
WHERE NOT EXISTS (SELECT 1 FROM public.store_contacts WHERE store_id = s.id);