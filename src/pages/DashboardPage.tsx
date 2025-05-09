
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {fullName}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Utenti</CardTitle>
              <CardDescription>
                Gestisci gli utenti della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Turni</CardTitle>
              <CardDescription>
                Organizza i turni di lavoro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funzionalità in arrivo...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spese</CardTitle>
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
