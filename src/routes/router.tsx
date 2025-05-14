
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { ErrorPage } from '@/components/common/ErrorPage';

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const AziendePage = lazy(() => import('@/pages/AziendePage'));
const AziendaDetailPage = lazy(() => import('@/pages/AziendaDetailPage'));
const ServiziPage = lazy(() => import('@/pages/ServiziPage'));
const ServizioDetailPage = lazy(() => import('@/pages/ServizioDetailPage'));
const ServizioNewPage = lazy(() => import('@/pages/ServizioNewPage'));
const ShiftsCalendarPage = lazy(() => import('@/pages/ShiftsCalendarPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const DashboardClientePage = lazy(() => import('@/pages/DashboardClientePage'));
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
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/dashboard',
    element: <AuthGuard><DashboardPage /></AuthGuard>,
  },
  {
    path: '/dashboard-cliente',
    element: <AuthGuard allowedRoles={['cliente']}><DashboardClientePage /></AuthGuard>,
  },
  {
    path: '/profile',
    element: <AuthGuard><ProfilePage /></AuthGuard>,
  },
  {
    path: '/users',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><UsersPage /></AuthGuard>,
  },
  {
    path: '/aziende',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><AziendePage /></AuthGuard>,
  },
  {
    path: '/aziende/:id',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><AziendaDetailPage /></AuthGuard>,
  },
  {
    path: '/servizi',
    element: <AuthGuard><ServiziPage /></AuthGuard>,
  },
  {
    path: '/servizi/new',
    element: <AuthGuard allowedRoles={['admin', 'socio', 'cliente']}><ServizioNewPage /></AuthGuard>,
  },
  {
    path: '/servizi/:id',
    element: <AuthGuard><ServizioDetailPage /></AuthGuard>,
  },
  {
    path: '/shifts',
    element: <AuthGuard><ShiftsCalendarPage /></AuthGuard>,
  },
  {
    path: '/impostazioni',
    element: <AuthGuard allowedRoles={['admin']}><ImpostazioniPage /></AuthGuard>,
  },
  {
    path: '/reports',
    element: <AuthGuard allowedRoles={['admin', 'socio']}><ReportsPage /></AuthGuard>,
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
