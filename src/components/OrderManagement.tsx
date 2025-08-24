import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin, Phone, Package, CheckCircle2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

const statusIcons = {
  pending: Clock,
  in_progress: Package,
  delivered: CheckCircle2,
  cancelled: Clock,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderManagement() {
  const { orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground">
            Your orders will appear here once you place them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = statusIcons[order.status];
        
        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Order from {order.stores.name}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={statusColors[order.status]}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[order.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₦{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{order.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}

              {/* Payment Method */}
              <div className="pt-2 border-t">
                <p className="text-sm">
                  <span className="font-medium">Payment Method:</span>{' '}
                  <span className="text-muted-foreground">Cash on Delivery</span>
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}