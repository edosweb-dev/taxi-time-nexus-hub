
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

// Import pages
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RecuperaPasswordPage from "@/pages/RecuperaPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientDashboardPage from "@/pages/cliente/ClientDashboardPage";
import AziendePage from "@/pages/aziende/AziendePage";
import AziendaDetailPage from "@/pages/aziende/AziendaDetailPage";
import UsersPage from "@/pages/UsersPage";
import ServiziPage from "@/pages/servizi/ServiziPage";
import ServizioDetailPage from "@/pages/servizi/ServizioDetailPage";
import NuovoServizioPage from "@/pages/servizi/NuovoServizioPage";
import AssistenzaPage from "@/pages/AssistenzaPage";
import VeicoliPage from "@/pages/veicoli/VeicoliPage";
import ShiftsPage from "@/pages/ShiftsPage";
import SpeseDipendentePage from "@/pages/SpeseDipendentePage";
import SpeseAziendaliPage from "@/pages/SpeseAziendaliPage";
import ImpostazioniPage from "@/pages/ImpostazioniPage";
import ReportsPage from "@/pages/ReportsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ClientServiziPage from "@/pages/cliente/ServiziPage";
import ClientNuovoServizioPage from "@/pages/cliente/NuovoServizioPage";
import ClientProfiloPage from "@/pages/cliente/ProfiloPage";

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
            <Route path="/dashboard-cliente" element={<ClientDashboardPage />} />
            <Route path="/dashboard-cliente/servizi" element={<ClientServiziPage />} />
            <Route path="/dashboard-cliente/nuovo-servizio" element={<ClientNuovoServizioPage />} />
            <Route path="/dashboard-cliente/profilo" element={<ClientProfiloPage />} />
            <Route path="/aziende" element={<AziendePage />} />
            <Route path="/aziende/:id" element={<AziendaDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/servizi" element={<ServiziPage />} />
            <Route path="/servizi/:id" element={<ServizioDetailPage />} />
            <Route path="/servizi/nuovo" element={<NuovoServizioPage />} />
            <Route path="/veicoli" element={<VeicoliPage />} />
            <Route path="/turni" element={<ShiftsPage />} />
            <Route path="/expenses" element={<SpeseDipendentePage />} />
            <Route path="/spese-aziendali" element={<SpeseAziendaliPage />} />
            <Route path="/impostazioni" element={<ImpostazioniPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/assistenza" element={<AssistenzaPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
