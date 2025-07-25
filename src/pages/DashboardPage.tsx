
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Building, MessageCircle } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Utente';
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleNavigate = (path: string) => () => {
    navigate(path);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-enhanced">Dashboard</h1>
            <p className="text-xl text-muted-foreground text-enhanced">
              Benvenuto, {fullName}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isAdminOrSocio && (
              <Card className={isAdminOrSocio ? "border-primary/30 shadow-md" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className={`h-5 w-5 ${isAdminOrSocio ? "text-primary" : "text-muted-foreground"}`} />
                    Gestione Utenti
                  </CardTitle>
                  <CardDescription>
                    Gestisci gli utenti della piattaforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <p className="text-sm">Gestisci i profili degli utenti e i loro permessi.</p>
                  <Button 
                    onClick={handleNavigate('/users')} 
                    className="mt-2"
                    variant={isAdminOrSocio ? "default" : "outline"}
                  >
                    Vai alla gestione utenti
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAdminOrSocio && (
              <Card className={isAdminOrSocio ? "border-primary/30 shadow-md" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className={`h-5 w-5 ${isAdminOrSocio ? "text-primary" : "text-muted-foreground"}`} />
                    Gestione Aziende
                  </CardTitle>
                  <CardDescription>
                    Gestisci le aziende clienti
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <p className="text-sm">Gestisci le aziende clienti e i loro referenti.</p>
                  <Button 
                    onClick={handleNavigate('/aziende')} 
                    className="mt-2"
                    variant={isAdminOrSocio ? "default" : "outline"}
                  >
                    Vai alla gestione aziende
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAdminOrSocio && (
              <Card className={isAdminOrSocio ? "border-primary/30 shadow-md" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className={`h-5 w-5 ${isAdminOrSocio ? "text-primary" : "text-muted-foreground"}`} />
                    Gestione Feedback
                  </CardTitle>
                  <CardDescription>
                    Visualizza e gestisci i feedback utenti
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <p className="text-sm">Gestisci i feedback ricevuti dagli utenti della piattaforma.</p>
                  <Button 
                    onClick={handleNavigate('/feedback')} 
                    className="mt-2"
                    variant={isAdminOrSocio ? "default" : "outline"}
                  >
                    Vai ai feedback
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/30 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Turni
                </CardTitle>
                <CardDescription>
                  Organizza i turni di lavoro
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                <p className="text-sm">Visualizza e gestisci i turni di lavoro del personale.</p>
                <Button onClick={handleNavigate('/turni')} className="mt-2">
                  Vai ai turni
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Spese Aziendali
                </CardTitle>
                <CardDescription>
                  Gestisci le spese aziendali
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                <p className="text-sm">Monitora e gestisci le spese aziendali.</p>
                <Button variant="outline" className="mt-2" onClick={handleNavigate('/spese-aziendali')}>
                  Vai alle spese
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
