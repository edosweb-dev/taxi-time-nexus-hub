
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
      } else if (profile.role === 'admin' || profile.role === 'socio') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      console.log('[Index] No user logged in, staying on index page');
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full taxitime-gradient flex items-center justify-center text-white text-3xl font-bold mb-8">
            T
          </div>
          <h1 className="text-4xl font-bold mb-4">TAXITIME V2</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            Piattaforma gestionale per aziende, dedicata all'organizzazione di servizi, utenti, turni e spese
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="bg-taxitime-600 hover:bg-taxitime-700 text-white"
              size="lg"
            >
              Accedi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
