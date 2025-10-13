
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Index] Current user profile:', profile);
    
    if (user && profile) {
      console.log('[Index] User is logged in, redirecting based on role:', profile.role);
      
      // Redirect based on role if already logged in
      if (profile.role === 'cliente') {
        navigate('/dashboard-cliente');
      } else if (profile.role === 'dipendente') {
        navigate('/dipendente/dashboard');
      } else if (profile.role === 'admin' || profile.role === 'socio') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      console.log('[Index] No user logged in, redirecting to login');
      navigate('/login');
    }
  }, [user, profile, navigate]);

  // Show nothing while redirecting
  return null;
};

export default Index;
