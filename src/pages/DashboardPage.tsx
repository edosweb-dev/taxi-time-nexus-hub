
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { profile } = useAuth();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Utente';

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="py-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight text-taxitime-800">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Benvenuto, {fullName}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-taxitime-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-taxitime-800">Gestione Utenti</CardTitle>
              <CardDescription>
                Gestisci gli utenti della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card className="border-taxitime-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-taxitime-800">Turni</CardTitle>
              <CardDescription>
                Organizza i turni di lavoro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card className="border-taxitime-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-taxitime-800">Spese</CardTitle>
              <CardDescription>
                Gestisci le spese aziendali
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
