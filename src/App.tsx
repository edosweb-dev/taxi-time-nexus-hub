import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { AuthGuard } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ClientDashboardPage = lazy(() => import('./pages/cliente/ClientDashboardPage'));

// Dipendente Pages
const DipendenteDashboard = lazy(() => import('./pages/dipendente/DipendenteDashboard'));
const ServiziAssegnatiPage = lazy(() => import('./pages/dipendente/ServiziAssegnatiPage'));
const CompletaServizioPage = lazy(() => import('./pages/dipendente/CompletaServizioPage'));
const DipendenteTurniPage = lazy(() => import('./pages/dipendente/TurniPage'));
const DipendenteSpesePage = lazy(() => import('./pages/dipendente/SpesePage'));
const DipendenteStipendiPage = lazy(() => import('./pages/dipendente/StipendiPage'));
const DipendenteNotFound = lazy(() => import('./pages/dipendente/DipendenteNotFound'));
const MobileUIShowcase = lazy(() => import('./components/mobile-first/MobileUIShowcase').then(module => ({ default: module.MobileUIShowcase })));
const ImpostazioniPage = lazy(() => import('./pages/ImpostazioniPage'));
const ServiziPage = lazy(() => import('./pages/servizi/ServiziPage'));
const ServizioCreaPage = lazy(() => import('./pages/servizi/ServizioCreaPage').then(module => ({ default: module.ServizioCreaPage })));
const NuovoServizioPage = lazy(() => import('./pages/servizi/NuovoServizioPage'));
const ServizioDetailPage = lazy(() => import('./pages/servizi/ServizioDetailPage'));
const EditServizioPage = lazy(() => import('./pages/servizi/EditServizioPage'));
const ModificaServizioPage = lazy(() => import('./pages/servizi/ModificaServizioPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const VeicoliPage = lazy(() => import('./pages/veicoli/VeicoliPage'));
const ConducentiEsterniPage = lazy(() => import('./pages/conducenti-esterni/ConducentiEsterniPage'));
const ConducenteEsternoDetailPage = lazy(() => import('./pages/conducenti-esterni/ConducenteEsternoDetailPage'));
const StipendiPage = lazy(() => import('./pages/StipendiPage'));
const MobileServiziPage = lazy(() => import('./pages/servizi/MobileServiziPage'));
const SpeseAziendaliPage = lazy(() => import('./pages/SpeseAziendaliPage'));
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const CalendarioTurniPage = lazy(() => import('./pages/CalendarioTurniPage'));
const MobileInserimentoMassivoPage = lazy(() => import('./pages/calendario-turni/MobileInserimentoMassivoPage'));
const ShiftReportsPage = lazy(() => import('./pages/shifts/ShiftReportsPage'));
const AziendePage = lazy(() => import('./pages/aziende/AziendePage'));
const NuovaAziendaPage = lazy(() => import('./pages/aziende/NuovaAziendaPage'));
const ModificaAziendaPage = lazy(() => import('./pages/aziende/ModificaAziendaPage'));
const AziendaDetailPage = lazy(() => import('./pages/aziende/AziendaDetailPage'));
const ReferenteDetailPage = lazy(() => import('./pages/referenti/ReferenteDetailPage'));
const ClientiPrivatiPage = lazy(() => import('./pages/clienti/ClientiPrivatiPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AssistenzaPage = lazy(() => import('./pages/AssistenzaPage'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  </div>
);

const queryClient = new QueryClient();

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
                <Route path="/nuovo-servizio" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <NuovoServizioPage />
                  </AuthGuard>
                } />
                <Route path="/servizi/crea" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <ServizioCreaPage />
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
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <FeedbackPage />
                  </AuthGuard>
                } />

                {/* Veicoli Routes */}
                <Route path="/veicoli" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <VeicoliPage />
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

                {/* Spese Aziendali Routes */}
                <Route path="/spese-aziendali" element={
                  <AuthGuard allowedRoles={['admin', 'socio']}>
                    <SpeseAziendaliPage />
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
              <Route path="/calendario-turni/inserimento-massivo" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <MobileInserimentoMassivoPage />
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

                <Route path="/dipendente/servizi-assegnati/:id" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <ServizioDetailPage />
                  </AuthGuard>
                } />

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

                {/* 404 per route dipendente non trovate */}
                <Route path="/dipendente/*" element={
                  <AuthGuard allowedRoles={['dipendente']}>
                    <DipendenteNotFound />
                  </AuthGuard>
                } />
                
                  {/* 404 Route */}
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