
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';
import DashboardPage from './pages/DashboardPage';
import ClientDashboardPage from './pages/cliente/ClientDashboardPage';
import ImpostazioniPage from './pages/ImpostazioniPage';
import ServiziPage from './pages/servizi/ServiziPage';
import NuovoServizioPage from './pages/servizi/NuovoServizioPage';
import ServizioDetailPage from './pages/servizi/ServizioDetailPage';
import UsersPage from './pages/UsersPage';
import VeicoliPage from './pages/veicoli/VeicoliPage';
import ConducentiEsterniPage from './pages/conducenti-esterni/ConducentiEsterniPage';
import StipendiPage from './pages/StipendiPage';
import SpeseAziendaliPage from './pages/SpeseAziendaliPage';
import ShiftsPage from './pages/ShiftsPage';
import ShiftReportsPage from './pages/shifts/ShiftReportsPage';
import AziendePage from './pages/aziende/AziendePage';
import AziendaDetailPage from './pages/aziende/AziendaDetailPage';
import FeedbackPage from './pages/FeedbackPage';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
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

              {/* Aziende Routes */}
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
              
              {/* Shifts Routes */}
              <Route path="/turni" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <ShiftsPage />
                </AuthGuard>
              } />
              <Route path="/turni/report" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <ShiftReportsPage />
                </AuthGuard>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
