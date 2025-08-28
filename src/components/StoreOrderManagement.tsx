import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, User, MapPin, Phone, Truck } from 'lucide-react';
import { Order } from '@/hooks/useOrders';

export function StoreOrderManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders for store owner (all orders for now - will be filtered by store later)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['store-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, data }: { orderId: string; status: string; data?: any }) => {
      const updateData: any = { status };
      
      if (data) {
        Object.assign(updateData, data);
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
      console.error('Error updating order:', error);
    },
  });

  const requestPickup = async (orderId: string) => {
    updateOrderStatus.mutate({
      orderId,
      status: 'ready_for_pickup',
      data: { pickup_requested_at: new Date().toISOString() }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary text-secondary-foreground';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'ready_for_pickup': return 'bg-orange-100 text-orange-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'New Order';
      case 'accepted': return 'Accepted';
      case 'packed': return 'Packed';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  const activeOrders = orders?.filter(order => 
    ['accepted', 'packed', 'ready_for_pickup', 'picked_up', 'in_transit'].includes(order.status)
  ) || [];
  const completedOrders = orders?.filter(order => order.status === 'delivered') || [];

  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          New Orders ({pendingOrders.length})
        </h3>
        <div className="grid gap-4">
          {pendingOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Customer ID: {order.user_id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{order.delivery_address}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Total: ${order.total_amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s)
                    </div>
                    {order.notes && (
                      <div className="text-sm text-muted-foreground">
                        Note: {order.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'accepted' })}
                    disabled={updateOrderStatus.isPending}
                  >
                    Accept Order
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'cancelled' })}
                    disabled={updateOrderStatus.isPending}
                  >
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No new orders at the moment
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Active Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Active Orders ({activeOrders.length})
        </h3>
        <div className="grid gap-4">
          {activeOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{order.delivery_address}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Total: ${order.total_amount}
                    </div>
                    {order.rider_id && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Rider assigned</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {order.status === 'accepted' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: 'packed' })}
                      disabled={updateOrderStatus.isPending}
                    >
                      Mark as Packed
                    </Button>
                  )}
                  {order.status === 'packed' && (
                    <Button 
                      size="sm" 
                      onClick={() => requestPickup(order.id)}
                      disabled={updateOrderStatus.isPending}
                    >
                      Request Pickup
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {activeOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active orders
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Completed Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Completed Orders ({completedOrders.slice(0, 5).length})</h3>
        <div className="grid gap-4">
          {completedOrders.slice(0, 5).map((order) => (
            <Card key={order.id} className="opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{order.phone_number}</span>
                  <span className="font-semibold">${order.total_amount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No completed orders yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}