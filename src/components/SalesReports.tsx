import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';

export function SalesReports() {
  const { user } = useAuth();

  // Fetch sales data
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate metrics
      const totalRevenue = data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = data.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Group by date for trend analysis
      const today = new Date().toDateString();
      const todayOrders = data.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        todayOrders: todayOrders.length,
        todayRevenue,
        recentOrders: data.slice(0, 10)
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading sales reports...</div>
      </div>
    );
  }

  const metrics = salesData || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    recentOrders: []
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              ${metrics.todayRevenue.toFixed(2)} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentOrders.length > 0 ? (
            <div className="space-y-2">
              {metrics.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-2 border border-border rounded">
                  <div>
                    <div className="font-medium">Order #{order.id.slice(-8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${order.total_amount}</div>
                    <div className="text-sm text-muted-foreground">{order.phone_number}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No completed orders yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}