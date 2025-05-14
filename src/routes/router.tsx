
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { ErrorPage } from '@/components/common/ErrorPage';

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const ImpostazioniPage = lazy(() => import('@/pages/ImpostazioniPage'));
const SpesePage = lazy(() => import('@/pages/SpesePage'));
const MovimentiPage = lazy(() => import('@/pages/MovimentiPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><DashboardPage /></AuthGuard>,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <AuthGuard><DashboardPage /></AuthGuard>,
  },
  {
    path: '/profile',
    element: <AuthGuard><DashboardPage /></AuthGuard>,
  },
  {
    path: '/users',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><UsersPage /></AuthGuard>,
  },
  {
    path: '/impostazioni',
    element: <AuthGuard allowedRoles={['admin']}><ImpostazioniPage /></AuthGuard>,
  },
  {
    path: '/spese',
    element: <AuthGuard><SpesePage /></AuthGuard>,
  },
  {
    path: '/movimenti',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><MovimentiPage /></AuthGuard>,
  },
]);
