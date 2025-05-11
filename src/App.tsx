
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
import ClientDashboardPage from "./pages/cliente/ClientDashboardPage";
import ShiftsPage from "./pages/ShiftsPage";
import UsersPage from "./pages/UsersPage";
import AziendePage from "./pages/aziende/AziendePage";
import AziendaDetailPage from "./pages/aziende/AziendaDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import Index from "./pages/Index";

// Client pages
import ClientServiziPage from "./pages/cliente/ServiziPage";
import ClientNuovoServizioPage from "./pages/cliente/NuovoServizioPage";
import ReportPage from "./pages/cliente/ReportPage";
import ProfiloPage from "./pages/cliente/ProfiloPage";

// Servizi pages
import AdminServiziPage from "./pages/servizi/ServiziPage";
import AdminNuovoServizioPage from "./pages/servizi/NuovoServizioPage";
import ServizioDetailPage from "./pages/servizi/ServizioDetailPage";

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
              {/* Root now redirects directly to login */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              {/* Keep the original index page available at /welcome for backward compatibility */}
              <Route path="/welcome" element={<Index />} />
              
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

              {/* Companies Page - restricted to admin and socio roles */}
              <Route path="/aziende" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <AziendePage />
                </AuthGuard>
              } />
              
              {/* Company Detail Page - restricted to admin and socio roles */}
              <Route path="/aziende/:id" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <AziendaDetailPage />
                </AuthGuard>
              } />
              
              {/* Protected routes for client role */}
              <Route path="/dashboard-cliente" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ClientDashboardPage />
                </AuthGuard>
              } />
              
              <Route path="/dashboard-cliente/servizi" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ClientServiziPage />
                </AuthGuard>
              } />
              
              <Route path="/dashboard-cliente/nuovo-servizio" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ClientNuovoServizioPage />
                </AuthGuard>
              } />
              
              <Route path="/dashboard-cliente/report" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ReportPage />
                </AuthGuard>
              } />
              
              <Route path="/dashboard-cliente/profilo" element={
                <AuthGuard allowedRoles={['cliente']}>
                  <ProfiloPage />
                </AuthGuard>
              } />
              
              {/* Servizi routes - accessible to all authenticated users */}
              <Route path="/servizi" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente', 'cliente']}>
                  <AdminServiziPage />
                </AuthGuard>
              } />
              
              <Route path="/nuovo-servizio" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'cliente']}>
                  <AdminNuovoServizioPage />
                </AuthGuard>
              } />
              
              {/* Service Detail Page */}
              <Route path="/servizi/:id" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente', 'cliente']}>
                  <ServizioDetailPage />
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
