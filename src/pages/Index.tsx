import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-8">
          <Home className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">Home Dash</h1>
          <p className="text-xl text-muted-foreground mb-8">Your friendly Estate errand runner — quick grocery dashes, Pharmacy drops, and “please help me buy” errands, all without leaving your gate.</p>
        </div>
        
        <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
          Get Started
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Sign up or log in to access your dashboard
        </p>
      </div>
    </div>;
};
export default Index;