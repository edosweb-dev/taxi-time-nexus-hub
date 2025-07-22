
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
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

const queryClient = new QueryClient();

function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { profile } = useAuth();

  if (!profile) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to a forbidden page or home if the user doesn't have the required role
    return <div>Forbidden</div>; // Or <Navigate to="/" />
  }

  return children;
}

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

              {/* Users Routes */}
              <Route path="/utenti" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <UsersPage />
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
              
              {/* Default Route - Redirect to login if no other route matches */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
