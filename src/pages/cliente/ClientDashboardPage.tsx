
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Azienda } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ClientDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [azienda, setAzienda] = useState<Azienda | null>(null);
  const [loading, setLoading] = useState(true);

  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Cliente';

  useEffect(() => {
    async function fetchAzienda() {
      if (!profile?.azienda_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('aziende')
          .select('*')
          .eq('id', profile.azienda_id)
          .single();

        if (error) {
          console.error('Error fetching company:', error);
        } else {
          setAzienda(data as Azienda);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAzienda();
  }, [profile?.azienda_id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Cliente</h1>
          <p className="text-muted-foreground">
            Benvenuto, {fullName}
            {azienda && <> · {azienda.nome}</>}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/30 shadow-md">
            <CardHeader>
              <CardTitle>Richiedi Servizio</CardTitle>
              <CardDescription>
                Richiedi un nuovo servizio taxi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Crea una nuova richiesta di servizio specificando data, orario e dettagli.</p>
              <Button onClick={() => navigate('/dashboard-cliente/nuovo-servizio')} className="w-full">
                Nuovo Servizio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>I Miei Servizi</CardTitle>
              <CardDescription>
                Visualizza i tuoi servizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Accedi allo storico di tutti i servizi richiesti e al loro stato attuale.</p>
              <Button onClick={() => navigate('/dashboard-cliente/servizi')} variant="outline" className="w-full">
                Visualizza Servizi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Mensili</CardTitle>
              <CardDescription>
                Visualizza i report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Accedi ai report mensili dei servizi utilizzati e relativi costi.</p>
              <Button onClick={() => navigate('/dashboard-cliente/report')} variant="outline" className="w-full">
                Vai ai Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
