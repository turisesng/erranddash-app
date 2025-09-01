import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, DollarSign, Clock } from 'lucide-react';

export function DeliveryHistory() {
  const { user } = useAuth();

  const { data: deliveryHistory, isLoading } = useQuery({
    queryKey: ['delivery-history', user?.id],
    queryFn: async (): Promise<any[]> => {
      if (!user) return [];
      
      try {
        // Use simpler query structure to avoid type issues
        const result = await supabase
          .from('orders')
          .select('*');
        
        if (result.error) throw result.error;
        
        // Filter the results manually to avoid complex type inference
        const filteredData = (result.data || []).filter((order: any) => 
          order.rider_id === user.id && order.status === 'delivered'
        );
        
        return filteredData.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } catch (error) {
        console.error('Error fetching delivery history:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading delivery history...</div>
      </div>
    );
  }

  const totalDeliveries = deliveryHistory?.length || 0;
  const totalEarnings = (deliveryHistory?.length || 0) * 5; // $5 per delivery

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.0</div>
            <p className="text-xs text-muted-foreground">
              Customer feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {deliveryHistory && deliveryHistory.length > 0 ? (
            <div className="space-y-4">
              {deliveryHistory.map((delivery: any) => (
                <Card key={delivery.id} className="border border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">Delivery #{delivery.id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        Delivered
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">From</div>
                            <div className="text-sm text-muted-foreground">
                              {delivery.stores?.name || 'Store'}
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
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">+$5.00</div>
                          <div className="text-sm text-muted-foreground">Delivery fee</div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          Order value: ${delivery.total_amount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No delivery history yet. Complete your first delivery to see it here!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}