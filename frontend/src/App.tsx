import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/Leads";
import CampaignsPage from "./pages/Campaigns";
import WhatsAppPage from "./pages/WhatsApp";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/UserManagement";
import ConfigurationPage from "./pages/Configuration";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/configuration" element={<ConfigurationPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
