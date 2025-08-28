import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, Phone, Store, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  store_id: string;
  items: any[];
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  status: string;
  notes?: string;
  created_at: string;
  rider_id?: string;
  pickup_requested_at?: string;
  picked_up_at?: string;
  estimated_delivery_time?: string;
  stores?: { name: string; address: string };
}

export function RiderDeliveryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available deliveries (ready for pickup but no rider assigned)
  const { data: availableDeliveries, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores:store_id (
            name,
            address
          )
        `)
        .eq('status', 'ready_for_pickup')
        .is('rider_id', null)
        .order('pickup_requested_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch rider's assigned deliveries
  const { data: myDeliveries, isLoading: loadingMine } = useQuery({
    queryKey: ['my-deliveries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores:store_id (
            name,
            address
          )
        `)
        .eq('rider_id', user.id)
        .in('status', ['picked_up', 'in_transit'])
        .order('picked_up_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const acceptDelivery = useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('orders')
        .update({ 
          rider_id: user.id,
          status: 'picked_up',
          picked_up_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
      toast({
        title: "Delivery Accepted",
        description: "You have been assigned to this delivery.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept delivery.",
        variant: "destructive",
      });
      console.error('Error accepting delivery:', error);
    },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updateData: any = { status };
      
      if (status === 'in_transit') {
        updateData.estimated_delivery_time = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update delivery status.",
        variant: "destructive",
      });
      console.error('Error updating delivery:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'bg-orange-100 text-orange-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  if (loadingAvailable || loadingMine) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Deliveries */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          Available Deliveries ({availableDeliveries?.length || 0})
        </h3>
        <div className="grid gap-4">
          {availableDeliveries?.map((delivery) => (
            <Card key={delivery.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Delivery #{delivery.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(delivery.pickup_requested_at!).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusText(delivery.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Pickup Location</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.stores?.name || 'Store Name'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.stores?.address || 'Store Address'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Delivery Address</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.delivery_address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Delivery Fee: $5.00
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order Value: ${delivery.total_amount}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{delivery.phone_number}</span>
                    </div>
                    {delivery.notes && (
                      <div className="text-sm text-muted-foreground">
                        Note: {delivery.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => acceptDelivery.mutate(delivery.id)}
                    disabled={acceptDelivery.isPending}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept Delivery
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!availableDeliveries || availableDeliveries.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No deliveries available at the moment
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* My Active Deliveries */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          My Active Deliveries ({myDeliveries?.length || 0})
        </h3>
        <div className="grid gap-4">
          {myDeliveries?.map((delivery) => (
            <Card key={delivery.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Delivery #{delivery.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Picked up: {new Date(delivery.picked_up_at!).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(delivery.status)}>
                    {getStatusText(delivery.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">From</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.stores?.name || 'Store Name'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">To</div>
                        <div className="text-sm text-muted-foreground">
                          {delivery.delivery_address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{delivery.phone_number}</span>
                    </div>
                    {delivery.estimated_delivery_time && (
                      <div className="text-sm text-muted-foreground">
                        ETA: {new Date(delivery.estimated_delivery_time).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {delivery.status === 'picked_up' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateDeliveryStatus.mutate({ orderId: delivery.id, status: 'in_transit' })}
                      disabled={updateDeliveryStatus.isPending}
                    >
                      Start Delivery
                    </Button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateDeliveryStatus.mutate({ orderId: delivery.id, status: 'delivered' })}
                      disabled={updateDeliveryStatus.isPending}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Contact Customer
                  </Button>
                  <Button variant="outline" size="sm">
                    View Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!myDeliveries || myDeliveries.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active deliveries
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}