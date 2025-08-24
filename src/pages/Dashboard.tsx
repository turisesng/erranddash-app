import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, User, LogOut, Home, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StoreDirectory } from '@/components/StoreDirectory';
import OrderManagement from '@/components/OrderManagement';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Home Dash</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome back!
            </h2>
            <p className="text-muted-foreground">
              Manage your residential services and profile
            </p>
          </div>

          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </TabsTrigger>
              <TabsTrigger value="stores" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Stores
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Welcome to your Home Dash! Here you can manage your residential services, 
                    view store profiles, and update your personal information.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Quick Actions</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• View nearby store profiles</li>
                        <li>• Update your contact information</li>
                        <li>• Manage preferences</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-2">Recent Activity</h3>
                      <p className="text-sm text-muted-foreground">
                        No recent activity to display
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stores" className="space-y-4">
              <StoreDirectory />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
              <OrderManagement />
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
                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                        <p className="text-muted-foreground mt-1">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">User ID</label>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">{user?.id}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
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