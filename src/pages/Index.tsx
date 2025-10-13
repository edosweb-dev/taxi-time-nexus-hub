
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/utils/navigation';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Index] Current user profile:', profile);
    
    if (user && profile) {
      console.log('[Index] User is logged in, redirecting based on role:', profile.role);
      const dashboardRoute = getDashboardRoute(profile.role);
      console.log(`[Index] Redirecting to ${dashboardRoute}`);
      navigate(dashboardRoute, { replace: true });
    } else {
      console.log('[Index] No user logged in, redirecting to login');
      navigate('/login');
    }
  }, [user, profile, navigate]);

  // Show nothing while redirecting
  return null;
};

export default Index;
