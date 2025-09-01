import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Home, User, Store, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    user,
    loading,
    signInWithGoogleForRole
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [signingInRole, setSigningInRole] = useState<string | null>(null);

  const handleRoleSignIn = async (role: string) => {
    setSigningInRole(role);
    try {
      const { error } = await signInWithGoogleForRole(role);
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to sign in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningInRole(null);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-8">
          <Home className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">Door Dash</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your reliable delivery management platform — seamless order tracking, 
            store connections, and efficient delivery coordination.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-6">
            Sign up or log in to access your dashboard
          </p>
          
          <div className="grid gap-3">
            <Button 
              onClick={() => handleRoleSignIn('customer')} 
              size="lg" 
              className="w-full flex items-center gap-2"
              disabled={signingInRole !== null}
            >
              {signingInRole === 'customer' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              Sign in as Customer
            </Button>
            
            <Button 
              onClick={() => handleRoleSignIn('storeOwner')} 
              size="lg" 
              variant="outline"
              className="w-full flex items-center gap-2"
              disabled={signingInRole !== null}
            >
              {signingInRole === 'storeOwner' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Store className="h-4 w-4" />
              )}
              Sign in as Store Owner
            </Button>
            
            <Button 
              onClick={() => handleRoleSignIn('rider')} 
              size="lg" 
              variant="outline"
              className="w-full flex items-center gap-2"
              disabled={signingInRole !== null}
            >
              {signingInRole === 'rider' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              Sign in as Rider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;