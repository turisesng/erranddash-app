import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  store_id: string;
  user_id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  status: string;
  payment_method: string;
  notes?: string;
  rider_id?: string;
  customer_notes?: string;
  store_notes?: string;
  rider_notes?: string;
  assignment_requested_at?: string;
  delivery_fee?: number;
  picked_up_at?: string;
  estimated_delivery_time?: string;
  pickup_requested_at?: string;
  created_at: string;
  updated_at: string;
}


export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores:store_id (
            name,
            address
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : []
      })) as (Order & { stores: { name: string; address: string } })[];
    },
    enabled: !!user,
  });


  return {
    orders: orders || [],
    isLoading,
  };
};