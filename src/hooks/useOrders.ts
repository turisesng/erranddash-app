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
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  store_id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  notes?: string;
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
            phone,
            address
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Order & { stores: { name: string; phone: string; address: string } })[];
    },
    enabled: !!user,
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: orders || [],
    isLoading,
    createOrder: createOrder.mutate,
    isCreating: createOrder.isPending,
  };
};