import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ImpostazioniPage from './pages/ImpostazioniPage';
import ServiziPage from './pages/ServiziPage';
import NuovoServizioPage from './pages/NuovoServizioPage';
import ServizioDetailPage from './pages/ServizioDetailPage';
import EditServizioPage from './pages/EditServizioPage';
import UsersPage from './pages/UsersPage';
import NewUserPage from './pages/NewUserPage';
import EditUserPage from './pages/EditUserPage';
import SpesePage from './pages/SpesePage';
import NuovaSpesaPage from './pages/NuovaSpesaPage';
import EditSpesaPage from './pages/EditSpesaPage';
import VeicoliPage from './pages/VeicoliPage';
import NuovoVeicoloPage from './pages/NuovoVeicoloPage';
import EditVeicoloPage from './pages/EditVeicoloPage';
import ConducentiEsterniPage from './pages/ConducentiEsterniPage';
import NuovoConducenteEsternoPage from './pages/NuovoConducenteEsternoPage';
import EditConducenteEsternoPage from './pages/EditConducenteEsternoPage';
import StipendiPage from './pages/StipendiPage';
import NuovoStipendioPage from './pages/NuovoStipendioPage';
import EditStipendioPage from './pages/EditStipendioPage';
import MovimentiPage from './pages/MovimentiPage';
import NuoviMovimentiMultipliPage from './pages/NuoviMovimentiMultipliPage';
import EditMovimentoPage from './pages/EditMovimentoPage';
import SpeseAziendaliPage from './pages/SpeseAziendaliPage';
import NuovaSpesaAziendalePage from './pages/NuovaSpesaAziendalePage';
import EditSpesaAziendalePage from './pages/EditSpesaAziendalePage';
import ShiftsPage from './pages/ShiftsPage';
import { QueryClient } from '@tanstack/react-query';
import ShiftReportsPage from './pages/shifts/ShiftReportsPage';

function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a more appropriate loading indicator
  }

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
          <QueryClient>
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
              <Route path="/servizi/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditServizioPage />
                </AuthGuard>
              } />

              {/* Users Routes */}
              <Route path="/utenti" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <UsersPage />
                </AuthGuard>
              } />
              <Route path="/nuovo-utente" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NewUserPage />
                </AuthGuard>
              } />
              <Route path="/utenti/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditUserPage />
                </AuthGuard>
              } />

              {/* Spese Routes */}
              <Route path="/spese" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <SpesePage />
                </AuthGuard>
              } />
              <Route path="/nuova-spesa" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <NuovaSpesaPage />
                </AuthGuard>
              } />
              <Route path="/spese/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio', 'dipendente']}>
                  <EditSpesaPage />
                </AuthGuard>
              } />

              {/* Veicoli Routes */}
              <Route path="/veicoli" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <VeicoliPage />
                </AuthGuard>
              } />
              <Route path="/nuovo-veicolo" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuovoVeicoloPage />
                </AuthGuard>
              } />
              <Route path="/veicoli/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditVeicoloPage />
                </AuthGuard>
              } />

              {/* Conducenti Esterni Routes */}
              <Route path="/conducenti-esterni" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <ConducentiEsterniPage />
                </AuthGuard>
              } />
              <Route path="/nuovo-conducente-esterno" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuovoConducenteEsternoPage />
                </AuthGuard>
              } />
              <Route path="/conducenti-esterni/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditConducenteEsternoPage />
                </AuthGuard>
              } />

              {/* Stipendi Routes */}
              <Route path="/stipendi" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <StipendiPage />
                </AuthGuard>
              } />
              <Route path="/nuovo-stipendio" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuovoStipendioPage />
                </AuthGuard>
              } />
              <Route path="/stipendi/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditStipendioPage />
                </AuthGuard>
              } />

              {/* Movimenti Routes */}
              <Route path="/movimenti" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <MovimentiPage />
                </AuthGuard>
              } />
              <Route path="/nuovi-movimenti-multipli" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuoviMovimentiMultipliPage />
                </AuthGuard>
              } />
              <Route path="/movimenti/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditMovimentoPage />
                </AuthGuard>
              } />

              {/* Spese Aziendali Routes */}
              <Route path="/spese-aziendali" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <SpeseAziendaliPage />
                </AuthGuard>
              } />
              <Route path="/nuova-spesa-aziendale" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <NuovaSpesaAziendalePage />
                </AuthGuard>
              } />
              <Route path="/spese-aziendali/:id/edit" element={
                <AuthGuard allowedRoles={['admin', 'socio']}>
                  <EditSpesaAziendalePage />
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
          </QueryClient>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
