import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, User, LogOut, Home, Package, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from '@/components/NotificationCenter';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { StoreOrderManagement } from '@/components/StoreOrderManagement';
import { SalesReports } from '@/components/SalesReports';

export default function StoreOwnerDashboard() {
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
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Store Owner Dashboard</h1>
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
              Store Management
            </h2>
            <p className="text-muted-foreground">
              Manage incoming orders, request pickups, and view sales reports
            </p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store Info
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <StoreOrderManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <SalesReports />
            </TabsContent>

            <TabsContent value="store" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Store Status</label>
                        <p className="text-muted-foreground mt-1">Active</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Store ID</label>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">Coming Soon</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-lg font-medium mb-4">Store Settings</h3>
                      <p className="text-muted-foreground">
                        Store management features will be available here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                        <p className="text-muted-foreground mt-1">Store Owner</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">User ID</label>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">{user?.id}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                      <p className="text-muted-foreground">
                        Profile management features will be available here
                      </p>
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