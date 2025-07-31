
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Azienda } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { MobileCard } from '@/components/ui/mobile-card';
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';

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
      <div className={RESPONSIVE_SPACING.SECTION_VERTICAL}>
        {/* Header Section */}
        <div className={RESPONSIVE_SPACING.ELEMENT_VERTICAL}>
          <Typography variant="h1">Dashboard Cliente</Typography>
          <Typography variant="body" className="text-muted-foreground">
            Benvenuto, {fullName}
            {azienda && <> · {azienda.nome}</>}
          </Typography>
        </div>

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
        </ResponsiveGrid>
      </div>
    </MainLayout>
  );
}
