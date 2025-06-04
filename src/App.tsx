
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

// Import pages that exist
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RecuperaPasswordPage from "@/pages/RecuperaPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientDashboardPage from "@/pages/ClientDashboardPage";
import AziendePage from "@/pages/aziende/AziendePage";
import UsersPage from "@/pages/UsersPage";
import ServiziPage from "@/pages/servizi/ServiziPage";
import NuovoServizioPage from "@/pages/servizi/NuovoServizioPage";
import ServizioDetailPage from "@/pages/servizi/ServizioDetailPage";
import AziendaDetailPage from "@/pages/aziende/AziendaDetailPage";
import AssistenzaPage from "@/pages/AssistenzaPage";
import UserBackupsPage from "@/pages/UserBackupsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import VeicoliPage from "@/pages/veicoli/VeicoliPage";
import StipendiPage from "@/pages/StipendiPage";
import ShiftsPage from "@/pages/ShiftsPage";
import SpeseDipendentePage from "@/pages/SpeseDipendentePage";
import SpeseAziendaliPage from "@/pages/SpeseAziendaliPage";
import ImpostazioniPage from "@/pages/ImpostazioniPage";
import ReportsPage from "@/pages/ReportsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ClienteServiziPage from "@/pages/cliente/ServiziPage";
import ClienteDashboardPage from "@/pages/cliente/ClientDashboardPage";
import ClienteNuovoServizioPage from "@/pages/cliente/NuovoServizioPage";
import ProfiloPage from "@/pages/cliente/ProfiloPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recupera-password" element={<RecuperaPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard-cliente" element={<ClienteDashboardPage />} />
            <Route path="/aziende" element={<AziendePage />} />
            <Route path="/aziende/:id" element={<AziendaDetailPage />} />
            <Route path="/utenti" element={<UsersPage />} />
            <Route path="/servizi" element={<ServiziPage />} />
            <Route path="/servizi/nuovo" element={<NuovoServizioPage />} />
            <Route path="/servizi/:id" element={<ServizioDetailPage />} />
            <Route path="/veicoli" element={<VeicoliPage />} />
            <Route path="/stipendi" element={<StipendiPage />} />
            <Route path="/turni" element={<ShiftsPage />} />
            <Route path="/spese" element={<SpeseDipendentePage />} />
            <Route path="/spese-aziendali" element={<SpeseAziendaliPage />} />
            <Route path="/impostazioni" element={<ImpostazioniPage />} />
            <Route path="/report" element={<ReportsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/assistenza" element={<AssistenzaPage />} />
            <Route path="/user-backups" element={<UserBackupsPage />} />
            
            {/* Client routes */}
            <Route path="/dashboard-cliente/servizi" element={<ClienteServiziPage />} />
            <Route path="/dashboard-cliente/nuovo-servizio" element={<ClienteNuovoServizioPage />} />
            <Route path="/dashboard-cliente/profilo" element={<ProfiloPage />} />
            
            {/* Catch all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
