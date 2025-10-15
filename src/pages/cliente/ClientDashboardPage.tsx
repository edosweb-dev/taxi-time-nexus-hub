import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Azienda } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Loader2, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { MobileCard } from '@/components/ui/mobile-card';
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Custom hook per stats dashboard cliente
const useClienteDashboardStats = () => {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Query 1: Servizi ultimi 30 giorni
  const { data: serviziUltimi30Giorni, isLoading: loadingUltimi30 } = useQuery({
    queryKey: ["servizi-ultimi-30-giorni", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const dataInizio = new Date();
      dataInizio.setDate(dataInizio.getDate() - 30);
      
      const { count, error } = await supabase
        .from("servizi")
        .select("*", { count: "exact", head: true })
        .eq("referente_id", user.id)
        .gte("data_servizio", dataInizio.toISOString().split('T')[0]);
      
      if (error) {
        console.error("Errore fetch servizi ultimi 30gg:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Query 2: Servizi in corso (stati: da_assegnare, assegnato)
  const { data: serviziInCorso, isLoading: loadingInCorso } = useQuery({
    queryKey: ["servizi-in-corso", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from("servizi")
        .select("*", { count: "exact", head: true })
        .eq("referente_id", user.id)
        .in("stato", ["da_assegnare", "assegnato"]);
      
      if (error) {
        console.error("Errore fetch servizi in corso:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Query 3: Servizi questo mese
  const { data: serviziMese, isLoading: loadingMese } = useQuery({
    queryKey: ["servizi-mese", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const oggi = new Date();
      const primoGiornoMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
      const ultimoGiornoMese = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
      
      const { count, error } = await supabase
        .from("servizi")
        .select("*", { count: "exact", head: true })
        .eq("referente_id", user.id)
        .gte("data_servizio", primoGiornoMese.toISOString().split('T')[0])
        .lte("data_servizio", ultimoGiornoMese.toISOString().split('T')[0]);
      
      if (error) {
        console.error("Errore fetch servizi mese:", error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user?.id,
  });

  return {
    stats: {
      serviziUltimi30Giorni: serviziUltimi30Giorni ?? 0,
      serviziInCorso: serviziInCorso ?? 0,
      serviziMese: serviziMese ?? 0,
    },
    isLoading: loadingUltimi30 || loadingInCorso || loadingMese,
  };
};

export default function ClientDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [azienda, setAzienda] = useState<Azienda | null>(null);
  const [loading, setLoading] = useState(true);

  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Cliente';

  const { stats, isLoading: statsLoading } = useClienteDashboardStats();

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
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        {/* Header Section */}
        <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
          <Typography variant="h1">Dashboard Cliente</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Benvenuto, {fullName}
            {azienda && <> · {azienda.nome}</>}
          </Typography>
        </div>

        {/* KPI Stats Section */}
        {statsLoading ? (
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 3, desktop: 3 }}
            gap="lg"
          >
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-1" />
                  <Skeleton className="h-3 w-[100px]" />
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        ) : (
          <ResponsiveGrid 
            cols={{ mobile: 1, tablet: 3, desktop: 3 }}
            gap="lg"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ultimi 30 Giorni
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.serviziUltimi30Giorni}</div>
                <p className="text-xs text-muted-foreground">
                  Servizi richiesti
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Corso
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.serviziInCorso}</div>
                <p className="text-xs text-muted-foreground">
                  Da assegnare o assegnati
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Questo Mese
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.serviziMese}</div>
                <p className="text-xs text-muted-foreground">
                  Servizi di {new Date().toLocaleDateString('it-IT', { month: 'long' })}
                </p>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        )}

        {/* Actions Grid */}
        <ResponsiveGrid
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="lg"
        >
          <MobileCard 
            interactive={true}
            className="border-primary/30 shadow-md"
            onClick={() => navigate('/dashboard-cliente/nuovo-servizio')}
          >
            <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
              <Typography variant="h3">Richiedi Servizio</Typography>
              <Typography variant="caption">
                Richiedi un nuovo servizio taxi
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Crea una nuova richiesta di servizio specificando data, orario e dettagli.
              </Typography>
              <Button className="w-full mt-4">
                Nuovo Servizio
              </Button>
            </div>
          </MobileCard>

          <MobileCard 
            interactive={true}
            onClick={() => navigate('/dashboard-cliente/servizi')}
          >
            <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
              <Typography variant="h3">I Miei Servizi</Typography>
              <Typography variant="caption">
                Visualizza i tuoi servizi
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Accedi allo storico di tutti i servizi richiesti e al loro stato attuale.
              </Typography>
              <Button variant="outline" className="w-full mt-4">
                Visualizza Servizi
              </Button>
            </div>
          </MobileCard>

          <MobileCard 
            interactive={true}
            onClick={() => navigate('/dashboard-cliente/report')}
          >
            <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
              <Typography variant="h3">Report Mensili</Typography>
              <Typography variant="caption">
                Visualizza i report
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Accedi ai report mensili dei servizi utilizzati e relativi costi.
              </Typography>
              <Button variant="outline" className="w-full mt-4">
                Vai ai Report
              </Button>
            </div>
          </MobileCard>

          <MobileCard 
            interactive={true}
            onClick={() => navigate('/dashboard-cliente/passeggeri')}
          >
            <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
              <Typography variant="h3">I Miei Passeggeri</Typography>
              <Typography variant="caption">
                Gestisci i contatti
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Visualizza e gestisci i passeggeri salvati per i tuoi servizi.
              </Typography>
              <Button variant="outline" className="w-full mt-4">
                Gestisci Passeggeri
              </Button>
            </div>
          </MobileCard>
        </ResponsiveGrid>
      </div>
    </MainLayout>
  );
}
