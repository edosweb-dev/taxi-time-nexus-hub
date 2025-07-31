
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { AuthGuard } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';
import DashboardPage from './pages/DashboardPage';
import ClientDashboardPage from './pages/cliente/ClientDashboardPage';
import ImpostazioniPage from './pages/ImpostazioniPage';
import ServiziPage from './pages/servizi/ServiziPage';
import NuovoServizioPage from './pages/servizi/NuovoServizioPage';
import ServizioDetailPage from './pages/servizi/ServizioDetailPage';
import EditServizioPage from './pages/servizi/EditServizioPage';
import UsersPage from './pages/UsersPage';
import VeicoliPage from './pages/veicoli/VeicoliPage';
import ConducentiEsterniPage from './pages/conducenti-esterni/ConducentiEsterniPage';
import StipendiPage from './pages/StipendiPage';
import SpeseAziendaliPage from './pages/SpeseAziendaliPage';
import CalendarioServiziPage from './pages/CalendarioServiziPage';
import ReportServiziPage from './pages/ReportServiziPage';

import CalendarioTurniPage from './pages/CalendarioTurniPage';
import ShiftReportsPage from './pages/shifts/ShiftReportsPage';
import AziendePage from './pages/aziende/AziendePage';
import NuovaAziendaPage from './pages/aziende/NuovaAziendaPage';
import AziendaDetailPage from './pages/aziende/AziendaDetailPage';
import ReferenteDetailPage from './pages/referenti/ReferenteDetailPage';
import FeedbackPage from './pages/FeedbackPage';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <LayoutProvider>
            <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

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
              <Route path="/servizi/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <EditServizioPage />
                </AuthGuard>
               } />
               <Route path="/calendario-servizi" element={
                 <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                   <CalendarioServiziPage />
                 </AuthGuard>
               } />
               <Route path="/report-servizi" element={
                 <AuthGuard allowedRoles={['admin', 'socio']}>
                   <ReportServiziPage />
                 </AuthGuard>
               } />

              {/* Aziende Routes */}
              <Route path="/aziende" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <AziendePage />
                </AuthGuard>
              } />
              <Route path="/nuova-azienda" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuovaAziendaPage />
                </AuthGuard>
              } />
              <Route path="/aziende/:id" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <AziendaDetailPage />
                </AuthGuard>
              } />

              {/* Referenti Routes */}
              <Route path="/referenti/:id" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <ReferenteDetailPage />
                </AuthGuard>
              } />

              {/* Users Routes */}
              <Route path="/users" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <UsersPage />
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
              <Route path="/report" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <ShiftReportsPage />
                </AuthGuard>
              } />
              <Route path="/gestione-turni/report" element={<Navigate to="/report" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </QueryClientProvider>
          </LayoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
