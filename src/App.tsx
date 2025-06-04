import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

// Import pages
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RecuperaPasswordPage from "@/pages/RecuperaPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Dashboard from "@/pages/Dashboard";
import DashboardCliente from "@/pages/DashboardCliente";
import AziendePage from "@/pages/AziendePage";
import UtentiPage from "@/pages/UtentiPage";
import ServiziPage from "@/pages/ServiziPage";
import AddServizioPage from "@/pages/AddServizioPage";
import EditServizioPage from "@/pages/EditServizioPage";
import ServizioDetailPage from "@/pages/ServizioDetailPage";
import AddAziendaPage from "@/pages/AddAziendaPage";
import EditAziendaPage from "@/pages/EditAziendaPage";
import AddUserPage from "@/pages/AddUserPage";
import EditUserPage from "@/pages/EditUserPage";
import ProfilePage from "@/pages/ProfilePage";
import AssistenzaPage from "@/pages/AssistenzaPage";
import UserBackupsPage from "@/pages/UserBackupsPage";
import UserBackupDetailPage from "@/pages/UserBackupDetailPage";

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-cliente" element={<DashboardCliente />} />
            <Route path="/aziende" element={<AziendePage />} />
            <Route path="/utenti" element={<UtentiPage />} />
            <Route path="/servizi" element={<ServiziPage />} />
            <Route path="/servizi/add" element={<AddServizioPage />} />
            <Route path="/servizi/edit/:id" element={<EditServizioPage />} />
            <Route path="/servizi/:id" element={<ServizioDetailPage />} />
            <Route path="/aziende/add" element={<AddAziendaPage />} />
            <Route path="/aziende/edit/:id" element={<EditAziendaPage />} />
            <Route path="/utenti/add" element={<AddUserPage />} />
            <Route path="/utenti/edit/:id" element={<EditUserPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/assistenza" element={<AssistenzaPage />} />
            <Route path="/user-backups" element={<UserBackupsPage />} />
            <Route path="/user-backups/:id" element={<UserBackupDetailPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
