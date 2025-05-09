
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import LoginPage from "./pages/LoginPage";
import RecuperaPasswordPage from "./pages/RecuperaPasswordPage";
import AssistenzaPage from "./pages/AssistenzaPage";
import DashboardPage from "./pages/DashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ShiftsPage from "./pages/ShiftsPage";
import UsersPage from "./pages/UsersPage"; // Add the import
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Redirect root to login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Public authentication routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recupera-password" element={<RecuperaPasswordPage />} />
              <Route path="/assistenza" element={<AssistenzaPage />} />
              
              {/* Protected routes for non-client roles */}
              <Route path="/dashboard" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <DashboardPage />
                </AuthGuard>
              } />
              
              <Route path="/shifts" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <ShiftsPage />
                </AuthGuard>
              } />
              
              {/* New Users Page - restricted to admin and socio roles */}
              <Route path="/users" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <UsersPage />
                </AuthGuard>
              } />
              
              {/* Protected routes for client role */}
              <Route path="/dashboard-cliente" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ClientDashboardPage />
                </AuthGuard>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
