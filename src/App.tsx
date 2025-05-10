
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
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disattiva la funzionalità di riportare al background durante eventi focus
      // Questo aiuta a prevenire che le query vengano rifatte quando ci spostiamo tra pagine
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Root redirect based on auth status */}
              <Route path="/" element={<Index />} />
              
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
              
              {/* Users Page - restricted to admin and socio roles */}
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
