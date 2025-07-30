
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function ServiziPage() {
  const { profile } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">I Miei Servizi</h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci i servizi richiesti
          </p>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-2">Nessun servizio attivo</h2>
          <p className="text-muted-foreground mb-4">
            Non hai ancora richiesto nessun servizio. Richiedi il tuo primo servizio ora!
          </p>
          <Button onClick={() => window.location.href = '/dashboard-cliente/nuovo-servizio'}>
            Richiedi Nuovo Servizio
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
