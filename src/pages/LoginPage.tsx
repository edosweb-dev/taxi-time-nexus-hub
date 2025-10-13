
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/utils/navigation';

export default function LoginPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[LoginPage] Checking authentication status:', { user, profile });
    
    if (user && profile) {
      console.log('[LoginPage] User already authenticated, redirecting based on role');
      const dashboardRoute = getDashboardRoute(profile.role);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, profile, navigate]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
