
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
import ServizioDetailPage from "./pages/servizi/ServizioDetailPage";

// Create router outside of component to avoid recreation on renders
const router = createBrowserRouter([
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
    element: <DashboardPage />
  },
  {
    path: "users",
    element: <UsersPage />
  },
  {
    path: "aziende",
    element: <AziendePage />
  },
  {
    path: "aziende/:id",
    element: <AziendaDetailPage />
  },
  {
    path: "servizi",
    element: <ServiziPage />
  },
  {
    path: "servizi/:id",
    element: <ServizioDetailPage />
  },
  {
    path: "nuovo-servizio",
    element: <NuovoServizioPage />
  },
  {
    path: "shifts",
    element: <ShiftsPage />
  },
  {
    path: "assistenza",
    element: <AssistenzaPage />
  },
  // Cliente routes
  {
    path: "cliente",
    element: <ClientDashboardPage />,
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
]);

function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Toaster />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
