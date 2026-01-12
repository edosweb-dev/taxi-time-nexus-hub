// App.tsx - Direct imports (no lazy loading) - Cache fix 2024-12-16
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { AuthGuard } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';

// Direct imports - removed lazy loading to fix cache issues
import DashboardPage from './pages/DashboardPage';
import ClientDashboardPage from './pages/cliente/ClientDashboardPage';
import ServiziClientePage from './pages/cliente/ServiziPage';
import PasseggeriCliente from './pages/cliente/PasseggeriCliente';
import DettaglioServizio from './pages/cliente/DettaglioServizio';
import ReportCliente from './pages/cliente/ReportCliente';

// Dipendente Pages
import DipendenteDashboard from './pages/dipendente/DipendenteDashboard';
import ServiziAssegnatiPage from './pages/dipendente/ServiziAssegnatiPage';
import CompletaServizioPage from './pages/dipendente/CompletaServizioPage';
import DipendenteTurniPage from './pages/dipendente/TurniPage';
import DipendenteSpesePage from './pages/dipendente/SpesePage';
import DipendenteStipendiPage from './pages/dipendente/StipendiPage';
import StoricoStipendiPage from './pages/dipendente/StoricoStipendi';
import DipendenteNotFound from './pages/dipendente/DipendenteNotFound';
import { MobileUIShowcase } from './components/mobile-first/MobileUIShowcase';
import ImpostazioniPage from './pages/ImpostazioniPage';
import ServiziPage from './pages/servizi/ServiziPage';
import { ServizioCreaPage } from './pages/servizi/ServizioCreaPage';
import NuovoServizioClientePage from './pages/cliente/NuovoServizioPage';
import ServizioConfermatoPage from './pages/cliente/ServizioConfermatoPage';
import ServizioDetailPage from './pages/servizi/ServizioDetailPage';
import EditServizioPage from './pages/servizi/EditServizioPage';
import ModificaServizioPage from './pages/servizi/ModificaServizioPage';
import RicercaServiziPage from './pages/servizi/RicercaServiziPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import VeicoliPage from './pages/veicoli/VeicoliPage';
import VeicoloDetailPage from './pages/veicoli/VeicoloDetailPage';
import ConducentiEsterniPage from './pages/conducenti-esterni/ConducentiEsterniPage';
import ConducenteEsternoDetailPage from './pages/conducenti-esterni/ConducenteEsternoDetailPage';
import StipendiPage from './pages/StipendiPage';
import StipendiDettaglioPage from './pages/stipendi/StipendiDettaglioPage';
import MobileServiziPage from './pages/servizi/MobileServiziPage';
import SpeseAziendaliPage from './pages/SpeseAziendaliPage';
import IncassiContantiPage from './pages/IncassiContantiPage';
import CalendarioPage from './pages/CalendarioPage';
import ReportPage from './pages/ReportPage';
import CalendarioTurniPage from './pages/CalendarioTurniPage';
import ShiftReportsPage from './pages/shifts/ShiftReportsPage';
import AziendePage from './pages/aziende/AziendePage';
import NuovaAziendaPage from './pages/aziende/NuovaAziendaPage';
import ModificaAziendaPage from './pages/aziende/ModificaAziendaPage';
import AziendaDetailPage from './pages/aziende/AziendaDetailPage';
import ReferenteDetailPage from './pages/referenti/ReferenteDetailPage';
import ClientiPrivatiPage from './pages/clienti/ClientiPrivatiPage';
import FeedbackPage from './pages/FeedbackPage';
import ProfilePage from './pages/ProfilePage';
import AssistenzaPage from './pages/AssistenzaPage';
import ReportPasseggeriPage from './pages/reports/ReportPasseggeriPage';
import ReportSociPage from './pages/ReportSociPage';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                   // Dati sempre considerati stale → refetch immediato
      gcTime: 5 * 60 * 1000,          // 5 minuti - garbage collection
      retry: 1,
      refetchOnWindowFocus: true,     // Refetch quando torna sulla pagina
      refetchOnMount: true,           // Refetch quando componente si monta
    },
  },
});

// Componente redirect dinamico per vecchia route dipendente
const RedirectToServizioDetail = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/servizi/${id}`} replace />;
};

function App() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <LayoutProvider>
            <QueryClientProvider client={queryClient}>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/assistenza" element={<AssistenzaPage />} />

                  {/* Index Route - handles role-based redirections */}
                  <Route path="/" element={<Index />} />

                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                      <DashboardPage />
                    </AuthGuard>
                  } />
                  
                  <Route path="/dashboard-cliente" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <ClientDashboardPage />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/servizi" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <ServiziClientePage />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/passeggeri" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <PasseggeriCliente />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/servizi/:id" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <DettaglioServizio />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/report" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <ReportCliente />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/nuovo-servizio" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <NuovoServizioClientePage />
                    </AuthGuard>
                  } />

                  <Route path="/dashboard-cliente/servizio-confermato" element={
                    <AuthGuard allowedRoles={['cliente']}>
                      <ServizioConfermatoPage />
                    </AuthGuard>
                  } />

                {/* Impostazioni Routes */}
                <Route path="/impostazioni" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ImpostazioniPage />
                  </AuthGuard>
                } />

                {/* Servizi Routes */}
                <Route path="/servizi" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <ServiziPage />
                  </AuthGuard>
                } />
                <Route path="/servizi-mobile" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <MobileServiziPage />
                  </AuthGuard>
                } />
                {/* Redirect per retrocompatibilità */}
                <Route path="/nuovo-servizio" element={<Navigate to="/servizi/crea" replace />} />
                <Route path="/servizi/crea" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ServizioCreaPage />
                  </AuthGuard>
                } />
                {/* Route ricerca PRIMA di :id per evitare conflitto */}
                <Route path="/servizi/ricerca" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <RicercaServiziPage />
                  </AuthGuard>
                } />
                <Route path="/servizi/:id/modifica" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'cliente']}>
                    <ModificaServizioPage />
                  </AuthGuard>
                } />
                <Route path="/servizi/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <ServizioDetailPage />
                  </AuthGuard>
                } />
                <Route path="/servizi/:id/edit" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <EditServizioPage />
                  </AuthGuard>
                } />
                <Route path="/calendario-servizi" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <CalendarioPage />
                  </AuthGuard>
                } />
                <Route path="/report-servizi" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ReportPage />
                  </AuthGuard>
                } />
                <Route path="/report-passeggeri" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ReportPasseggeriPage />
                  </AuthGuard>
                } />
                <Route path="/report-soci" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ReportSociPage />
                  </AuthGuard>
                } />

                {/* Aziende Routes */}
                <Route path="/aziende" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <AziendePage />
                  </AuthGuard>
                } />
                <Route path="/aziende/nuovo" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <NuovaAziendaPage />
                  </AuthGuard>
                } />
                <Route path="/aziende/:id/modifica" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ModificaAziendaPage />
                  </AuthGuard>
                } />
                <Route path="/aziende/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <AziendaDetailPage />
                  </AuthGuard>
                } />
                {/* Legacy route redirect */}
                <Route path="/nuova-azienda" element={<Navigate to="/aziende/nuovo" replace />} />

                {/* Referenti Routes */}
                <Route path="/referenti/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ReferenteDetailPage />
                  </AuthGuard>
                } />

                {/* Clienti Privati Routes */}
                <Route path="/clienti-privati" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ClientiPrivatiPage />
                  </AuthGuard>
                } />

                {/* Users Routes */}
                <Route path="/users" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <UsersPage />
                  </AuthGuard>
                } />
                <Route path="/users/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <UserDetailPage />
                  </AuthGuard>
                } />

                {/* Feedback Routes */}
                <Route path="/feedback" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <FeedbackPage />
                  </AuthGuard>
                } />

                {/* Veicoli Routes */}
                <Route path="/veicoli" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <VeicoliPage />
                  </AuthGuard>
                } />
                <Route path="/veicoli/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <VeicoloDetailPage />
                  </AuthGuard>
                } />

                {/* Conducenti Esterni Routes */}
                <Route path="/conducenti-esterni" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ConducentiEsterniPage />
                  </AuthGuard>
                } />
                <Route path="/conducenti-esterni/nuovo" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ConducenteEsternoDetailPage />
                  </AuthGuard>
                } />
                <Route path="/conducenti-esterni/:id" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ConducenteEsternoDetailPage />
                  </AuthGuard>
                } />

                {/* Stipendi Routes */}
                <Route path="/stipendi" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <StipendiPage />
                  </AuthGuard>
                } />
                <Route path="/utenti/:userId/stipendio" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <StipendiDettaglioPage />
                  </AuthGuard>
                } />

                {/* Spese Aziendali Routes */}
                <Route path="/spese-aziendali" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <SpeseAziendaliPage />
                  </AuthGuard>
                } />
                <Route path="/spese-aziendali/incassi-contanti" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <IncassiContantiPage />
                  </AuthGuard>
                } />
                
                {/* Shifts Routes - calendario-turni come pagina principale */}
                <Route path="/turni" element={<Navigate to="/calendario-turni" replace />} />
                <Route path="/gestione-turni" element={<Navigate to="/calendario-turni" replace />} />
              <Route path="/calendario-turni" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <CalendarioTurniPage />
                </AuthGuard>
              } />
                <Route path="/report" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <ShiftReportsPage />
                  </AuthGuard>
                } />
                <Route path="/gestione-turni/report" element={<Navigate to="/report" replace />} />
                
                {/* Mobile UI Showcase Route - Development */}
                <Route path="/mobile-test" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <MobileUIShowcase />
                  </AuthGuard>
                } />
                
                {/* Mobile UI Showcase Route - Development */}
                <Route path="/mobile-showcase" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                    <MobileUIShowcase />
                  </AuthGuard>
                } />
                
                {/* Profile Route */}
                <Route path="/profile" element={
                  <AuthGuard allowedRoles={['admin', 'socio', 'dipendente', 'cliente']}>
                    <ProfilePage />
                  </AuthGuard>
                } />

                {/* Dipendente Routes - Sezione Dedicata */}
                <Route path="/dipendente" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <Navigate to="/dipendente/dashboard" replace />
                  </AuthGuard>
                } />

                <Route path="/dipendente/dashboard" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteDashboard />
                  </AuthGuard>
                } />

                <Route path="/dipendente/servizi-assegnati" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <ServiziAssegnatiPage />
                  </AuthGuard>
                } />

                {/* Redirect vecchia route dipendente alla route unificata */}
                <Route 
                  path="/dipendente/servizi-assegnati/:id" 
                  element={<RedirectToServizioDetail />} 
                />

                <Route path="/dipendente/servizi-assegnati/:id/completa" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <CompletaServizioPage />
                  </AuthGuard>
                } />

                <Route path="/dipendente/turni" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteTurniPage />
                  </AuthGuard>
                } />

                <Route path="/dipendente/spese" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteSpesePage />
                  </AuthGuard>
                } />

                <Route path="/dipendente/stipendi" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteStipendiPage />
                  </AuthGuard>
                } />

                <Route path="/dipendente/storico-stipendi" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <StoricoStipendiPage />
                  </AuthGuard>
                } />

                {/* Catch-all redirect for invalid dipendente routes */}
                <Route path="/dipendente/*" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteNotFound />
                  </AuthGuard>
                } />

                {/* Fallback: redirect qualsiasi URL non riconosciuto */}
                <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </Suspense>
            </QueryClientProvider>
          </LayoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
