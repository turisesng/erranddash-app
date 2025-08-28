import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, User, LogOut, MapPin, Package, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from '@/components/NotificationCenter';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { RiderDeliveryManagement } from '@/components/RiderDeliveryManagement';
import { DeliveryHistory } from '@/components/DeliveryHistory';

export default function RiderDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Initialize push notifications
  usePushNotifications();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Rider Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Delivery Management
            </h2>
            <p className="text-muted-foreground">
              Accept delivery jobs, update delivery status, and track your performance
            </p>
          </div>

          <Tabs defaultValue="deliveries" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="deliveries" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Deliveries
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deliveries" className="space-y-4">
              <RiderDeliveryManagement />
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Map View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Google Maps integration will be available here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <DeliveryHistory />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Role</label>
                        <p className="text-muted-foreground mt-1">Dispatch Rider</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Status</label>
                        <p className="text-muted-foreground mt-1">Available</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">User ID</label>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">{user?.id}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-lg font-medium mb-4">Rider Stats</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">0</div>
                          <div className="text-sm text-muted-foreground">Deliveries Today</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">0</div>
                          <div className="text-sm text-muted-foreground">Total Deliveries</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">5.0</div>
                          <div className="text-sm text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}