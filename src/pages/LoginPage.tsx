
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      // Redirect based on role
      if (profile.role === 'cliente') {
        navigate('/dashboard-cliente');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
