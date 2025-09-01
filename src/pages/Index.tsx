import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Home, User, Store, Truck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/delivery-riders-hero.jpg';
import doorDashLogo from '@/assets/door-dash-logo.png';

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
    <div className="min-h-screen relative">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <img src={doorDashLogo} alt="Door Dash Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-white">Door Dash</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-white hover:text-primary transition-colors">Home</a>
          <a href="#" className="text-white hover:text-primary transition-colors">About</a>
          <a href="#" className="text-white hover:text-primary transition-colors">FAQ</a>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            Sign Up
          </Button>
        </div>
        <Menu className="md:hidden h-6 w-6 text-white" />
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)]">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Door Dash</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Your reliable delivery management platform — seamless order tracking, 
              store connections, and efficient delivery coordination.
            </p>
          </div>
          
          <div className="space-y-6">
            <p className="text-white/80 mb-8 text-lg">
              Sign up or log in to access your dashboard
            </p>
            
            <div className="grid gap-4 max-w-md mx-auto">
              <Button 
                onClick={() => handleRoleSignIn('customer')} 
                size="lg" 
                className="w-full flex items-center gap-3 bg-primary hover:bg-primary/90 text-white py-4"
                disabled={signingInRole !== null}
              >
                {signingInRole === 'customer' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                Sign in as Customer
              </Button>
              
              <Button 
                onClick={() => handleRoleSignIn('storeOwner')} 
                size="lg" 
                variant="outline"
                className="w-full flex items-center gap-3 bg-white/10 text-white border-white/30 hover:bg-white/20 py-4"
                disabled={signingInRole !== null}
              >
                {signingInRole === 'storeOwner' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Store className="h-5 w-5" />
                )}
                Sign in as Store Owner
              </Button>
              
              <Button 
                onClick={() => handleRoleSignIn('rider')} 
                size="lg" 
                variant="outline"
                className="w-full flex items-center gap-3 bg-white/10 text-white border-white/30 hover:bg-white/20 py-4"
                disabled={signingInRole !== null}
              >
                {signingInRole === 'rider' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Truck className="h-5 w-5" />
                )}
                Sign in as Rider
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative z-10 bg-black/80 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center p-6">
              <Store className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Grocery Delivery</h3>
              <p className="text-white/80">
                Get groceries from your favourite stores within the estate, delivered fast to your door.
              </p>
            </div>
            <div className="text-center p-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Shopping On Your Behalf</h3>
              <p className="text-white/80">
                Our riders buy items for you when you can't step out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;