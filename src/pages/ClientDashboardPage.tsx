
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientDashboardPage() {
  const { profile } = useAuth();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Cliente';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Cliente</h1>
          <p className="text-muted-foreground">
            Benvenuto, {fullName}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>I tuoi servizi</CardTitle>
              <CardDescription>
                Visualizza i servizi prenotati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nuova prenotazione</CardTitle>
              <CardDescription>
                Prenota un nuovo servizio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profilo</CardTitle>
              <CardDescription>
                Gestisci i dati del tuo profilo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
