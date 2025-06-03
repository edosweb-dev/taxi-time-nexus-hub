
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UsersPage from './pages/UsersPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import RecuperaPasswordPage from './pages/RecuperaPasswordPage';
import ReportsPage from './pages/ReportsPage';
import StipendiPage from './pages/StipendiPage';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import AziendePage from './pages/aziende/AziendePage';
import AziendaDetailPage from './pages/aziende/AziendaDetailPage';
import ServiziPage from './pages/servizi/ServiziPage';
import NuovoServizioPage from './pages/servizi/NuovoServizioPage';
import ServizioDetailPage from './pages/servizi/ServizioDetailPage';
import VeicoliPage from './pages/veicoli/VeicoliPage';
import ShiftsPage from './pages/ShiftsPage';
import ImpostazioniPage from './pages/ImpostazioniPage';
import SpeseDipendentePage from './pages/SpeseDipendentePage';
import SpeseAziendaliPage from './pages/SpeseAziendaliPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recupera-password" element={<RecuperaPasswordPage />} />

            <Route path="/dashboard" element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            } />
            
            <Route path="/users" element={
              <AuthGuard allowedRoles={['admin']}>
                <UsersPage />
              </AuthGuard>
            } />
            
            <Route path="/aziende" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <AziendePage />
              </AuthGuard>
            } />
            
            <Route path="/aziende/:id" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <AziendaDetailPage />
              </AuthGuard>
            } />

            <Route path="/servizi" element={
              <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                <ServiziPage />
              </AuthGuard>
            } />
            
            <Route path="/nuovo-servizio" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <NuovoServizioPage />
              </AuthGuard>
            } />
            
            <Route path="/servizi/:id" element={
              <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                <ServizioDetailPage />
              </AuthGuard>
            } />

            <Route path="/veicoli" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <VeicoliPage />
              </AuthGuard>
            } />

            <Route path="/turni" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <ShiftsPage />
              </AuthGuard>
            } />
            
            {/* Route spese con logica basata sul ruolo */}
            <Route path="/spese" element={
              <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                <SpeseDipendentePage />
              </AuthGuard>
            } />
            
            <Route path="/spese-dipendente" element={
              <AuthGuard allowedRoles={['dipendente']}>
                <SpeseDipendentePage />
              </AuthGuard>
            } />
            
            <Route path="/spese-aziendali" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <SpeseAziendaliPage />
              </AuthGuard>
            } />
            
            <Route path="/stipendi" element={
              <AuthGuard allowedRoles={['admin']}>
                <StipendiPage />
              </AuthGuard>
            } />
            
            <Route path="/movimenti" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Movimenti</h1>
                  <p className="text-muted-foreground">Pagina in sviluppo</p>
                </div>
              </AuthGuard>
            } />
            
            <Route path="/profilo" element={
              <AuthGuard allowedRoles={['cliente']}>
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Profilo</h1>
                  <p className="text-muted-foreground">Pagina in sviluppo</p>
                </div>
              </AuthGuard>
            } />
            
            <Route path="/impostazioni" element={
              <AuthGuard allowedRoles={['admin', 'socio']}>
                <ImpostazioniPage />
              </AuthGuard>
            } />
            
            <Route path="/reports" element={
              <AuthGuard allowedRoles={['admin', 'socio', 'cliente']}>
                <ReportsPage />
              </AuthGuard>
            } />
            
            <Route path="/cliente" element={
              <AuthGuard allowedRoles={['cliente']}>
                <ClientDashboardPage />
              </AuthGuard>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
