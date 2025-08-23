import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: '',
  });
  
  const [signupForm, setSignupForm] = useState({
    phone: '',
    password: '',
    fullName: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginForm.phone, loginForm.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid phone number or password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(signupForm.phone, signupForm.password, signupForm.fullName);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your phone for verification.",
      });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Home Dash</CardTitle>
          <CardDescription>
            Welcome to your residential management app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPhone">Phone Number</Label>
                  <Input
                    id="signupPhone"
                    type="tel"
                    placeholder="+1234567890"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}