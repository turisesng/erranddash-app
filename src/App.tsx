import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import StoreProfile from "./pages/StoreProfile";
import NotFound from "./pages/NotFound";

const DashboardRouter = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('customer');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile && (profile as any).user_role) {
        setUserRole((profile as any).user_role);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (userRole) {
    case 'storeOwner':
      return <StoreOwnerDashboard />;
    case 'rider':
      return <RiderDashboard />;
    case 'customer':
    default:
      return <CustomerDashboard />;
  }
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stores/:storeId" 
              element={
                <ProtectedRoute>
                  <StoreProfile />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
