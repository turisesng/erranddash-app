-- Create enum for store categories
CREATE TYPE public.store_category AS ENUM ('grocery', 'pharmacy', 'eatery', 'suya', 'others');

-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category public.store_category NOT NULL,
  contact_info JSONB DEFAULT '{}',
  address TEXT,
  phone TEXT,
  email TEXT,
  hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Create policies for stores (publicly viewable for now)
CREATE POLICY "Stores are viewable by everyone" 
ON public.stores 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample stores for demonstration
INSERT INTO public.stores (name, description, category, address, phone, email, hours) VALUES 
(
  'Fresh Mart Grocery', 
  'Your neighborhood grocery store with fresh produce, dairy, and household essentials. We pride ourselves on quality products and friendly service.',
  'grocery',
  '123 Main Street, Downtown',
  '+1 (555) 123-4567',
  'info@freshmart.com',
  '{"monday": "8:00 AM - 9:00 PM", "tuesday": "8:00 AM - 9:00 PM", "wednesday": "8:00 AM - 9:00 PM", "thursday": "8:00 AM - 9:00 PM", "friday": "8:00 AM - 10:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "9:00 AM - 8:00 PM"}'
),
(
  'HealthPlus Pharmacy', 
  'Full-service pharmacy offering prescription medications, over-the-counter drugs, and health consultations. Licensed pharmacists available.',
  'pharmacy',
  '456 Oak Avenue, Medical District',
  '+1 (555) 234-5678',
  'contact@healthplus.com',
  '{"monday": "7:00 AM - 11:00 PM", "tuesday": "7:00 AM - 11:00 PM", "wednesday": "7:00 AM - 11:00 PM", "thursday": "7:00 AM - 11:00 PM", "friday": "7:00 AM - 11:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "9:00 AM - 9:00 PM"}'
),
(
  'Mama''s Kitchen', 
  'Authentic home-style cooking with daily specials. Family recipes passed down through generations. Comfortable dining atmosphere.',
  'eatery',
  '789 Food Street, Residential Area',
  '+1 (555) 345-6789',
  'orders@mamaskitchen.com',
  '{"monday": "11:00 AM - 10:00 PM", "tuesday": "11:00 AM - 10:00 PM", "wednesday": "11:00 AM - 10:00 PM", "thursday": "11:00 AM - 10:00 PM", "friday": "11:00 AM - 11:00 PM", "saturday": "11:00 AM - 11:00 PM", "sunday": "12:00 PM - 9:00 PM"}'
),
(
  'Suya Corner', 
  'Best suya in town! Fresh grilled meats with authentic Nigerian spices. Also serving peppersoup and other local delicacies.',
  'suya',
  '321 Spice Lane, Market Square',
  '+1 (555) 456-7890',
  'suyacorner@email.com',
  '{"monday": "6:00 PM - 2:00 AM", "tuesday": "6:00 PM - 2:00 AM", "wednesday": "6:00 PM - 2:00 AM", "thursday": "6:00 PM - 2:00 AM", "friday": "6:00 PM - 3:00 AM", "saturday": "6:00 PM - 3:00 AM", "sunday": "6:00 PM - 1:00 AM"}'
),
(
  'QuickFix Hardware', 
  'Hardware store for all your home repair and improvement needs. Tools, parts, and expert advice available.',
  'others',
  '654 Tool Road, Industrial Area',
  '+1 (555) 567-8901',
  'help@quickfix.com',
  '{"monday": "7:00 AM - 7:00 PM", "tuesday": "7:00 AM - 7:00 PM", "wednesday": "7:00 AM - 7:00 PM", "thursday": "7:00 AM - 7:00 PM", "friday": "7:00 AM - 7:00 PM", "saturday": "8:00 AM - 6:00 PM", "sunday": "10:00 AM - 4:00 PM"}'
);