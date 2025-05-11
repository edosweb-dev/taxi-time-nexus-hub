
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/ui/theme-provider"

import Index from "@/pages/Index"
import LoginPage from "@/pages/LoginPage"
import RecuperaPasswordPage from "@/pages/RecuperaPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import AziendePage from "@/pages/aziende/AziendePage";
import AziendaDetailPage from "@/pages/aziende/AziendaDetailPage";
import ServiziPage from "@/pages/servizi/ServiziPage";
import NuovoServizioPage from "@/pages/servizi/NuovoServizioPage";
import ShiftsPage from "@/pages/ShiftsPage";
import AssistenzaPage from "@/pages/AssistenzaPage";
import ClientDashboardPage from "@/pages/cliente/ClientDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";

import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import ServizioDetailPage from "./pages/servizi/ServizioDetailPage";

function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <Toaster />
          <RouterProvider router={
            createBrowserRouter([
              {
                path: "",
                element: <Index />
              },
              {
                path: "login",
                element: <LoginPage />
              },
              {
                path: "recupera-password",
                element: <RecuperaPasswordPage />
              },
              {
                path: "dashboard",
                element: <AuthGuard><DashboardPage /></AuthGuard>
              },
              {
                path: "users",
                element: <AuthGuard allowedRoles={["admin", "socio"]}><UsersPage /></AuthGuard>
              },
              {
                path: "aziende",
                element: <AuthGuard allowedRoles={["admin", "socio"]}><AziendePage /></AuthGuard>
              },
              {
                path: "aziende/:id",
                element: <AuthGuard allowedRoles={["admin", "socio"]}><AziendaDetailPage /></AuthGuard>
              },
              {
                path: "servizi",
                element: <AuthGuard><ServiziPage /></AuthGuard>
              },
              {
                path: "servizi/:id",
                element: <AuthGuard><ServizioDetailPage /></AuthGuard>
              },
              {
                path: "nuovo-servizio",
                element: <AuthGuard allowedRoles={["admin", "socio", "cliente"]}><NuovoServizioPage /></AuthGuard>
              },
              {
                path: "shifts",
                element: <AuthGuard allowedRoles={["admin", "socio"]}><ShiftsPage /></AuthGuard>
              },
              {
                path: "assistenza",
                element: <AuthGuard><AssistenzaPage /></AuthGuard>
              },
              // Cliente routes
              {
                path: "cliente",
                element: <AuthGuard allowedRoles={["cliente"]}><ClientDashboardPage /></AuthGuard>,
                children: [
                  {
                    path: "",
                    element: <div>Client Dashboard</div>
                  }
                ]
              },
              {
                path: "*",
                element: <NotFoundPage />
              }
            ])
          } />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
