import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StoreCategory = 'grocery' | 'pharmacy' | 'eatery' | 'suya' | 'others';

export interface Store {
  id: string;
  name: string;
  description: string | null;
  category: StoreCategory;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export const useStores = (category?: StoreCategory) => {
  return useQuery({
    queryKey: ['stores', category],
    queryFn: async () => {
      let query = supabase
        .from('stores')
        .select('*')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Store[];
    },
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Store | null;
    },
  });
};

export const categoryLabels: Record<StoreCategory, string> = {
  grocery: 'Grocery',
  pharmacy: 'Pharmacy', 
  eatery: 'Eatery',
  suya: 'Suya',
  others: 'Others'
};

export const categoryIcons: Record<StoreCategory, string> = {
  grocery: 'ShoppingCart',
  pharmacy: 'Cross',
  eatery: 'UtensilsCrossed',
  suya: 'Flame',
  others: 'Store'
};