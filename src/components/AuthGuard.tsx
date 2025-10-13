
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  console.log('[AuthGuard] Checking access for path:', location.pathname);
  console.log('[AuthGuard] Current user profile:', profile);
  console.log('[AuthGuard] Allowed roles:', allowedRoles);

  if (loading) {
    console.log('[AuthGuard] Auth is loading, showing loader');
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-taxitime-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('[AuthGuard] No user logged in, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special case: dipendente accessing /dashboard should be redirected to /dipendente/dashboard
  if (profile?.role === 'dipendente' && location.pathname === '/dashboard') {
    console.log('[AuthGuard] Dipendente accessing /dashboard, redirecting to /dipendente/dashboard');
    return <Navigate to="/dipendente/dashboard" replace />;
  }

  // Check if user role has access to this route
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    console.log('[AuthGuard] User does not have appropriate role, redirecting');
    // Only perform role-based redirects if they're actually trying to access a protected route
    // This prevents redirects during user creation operations
    
    // If accessing /users page specifically with an admin account, do not redirect
    // This is to handle the case where newly created users might otherwise cause redirection
    if (location.pathname === '/users' && (profile.role === 'admin' || profile.role === 'socio')) {
      console.log('[AuthGuard] Special case: admin/socio on users page - allowing access');
      return <>{children}</>;
    }
    
    // Normal role-based redirect
    if (profile.role === 'cliente') {
      console.log('[AuthGuard] Redirecting client to client dashboard');
      return <Navigate to="/dashboard-cliente" replace />;
    } else if (profile.role === 'dipendente') {
      console.log('[AuthGuard] Redirecting dipendente to dipendente dashboard');
      return <Navigate to="/dipendente/dashboard" replace />;
    } else {
      console.log('[AuthGuard] Redirecting staff to main dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User has access to this route
  console.log('[AuthGuard] Access granted');
  return <>{children}</>;
}
