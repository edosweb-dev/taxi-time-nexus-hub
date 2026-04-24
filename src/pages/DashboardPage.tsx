import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InserimentoServizioModal } from '@/components/servizi/InserimentoServizioModal';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Clock, Calendar, DollarSign, Car,
  TrendingUp, TrendingDown, ArrowRight, Activity,
  AlertCircle, CheckCircle2, UserCheck,
  Wallet, BarChart3, Plus
} from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatMinutesToHuman(minutes: number | null): string {
  if (minutes === null) return '';
  if (minutes < 60) return `${minutes}min attesa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h attesa`;
  const days = Math.floor(hours / 24);
  return `${days}g attesa`;
}

function percentDelta(current: number, previous: number): { label: string; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0 && current === 0) return { label: '0%', direction: 'neutral' };
  if (previous === 0) return { label: 'N/A', direction: 'neutral' };
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return {
    label: `${sign}${delta.toFixed(1)}%`,
    direction: delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'neutral',
  };
}

function ActionCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-blue-600', bgColor = 'bg-blue-100',
  onClick, urgent = false
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  bgColor?: string;
  onClick?: () => void;
  urgent?: boolean;
}) {
  return (
    <Card
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${urgent ? 'border-destructive/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {urgent && <Badge variant="destructive">Urgente</Badge>}
        </div>
        <div className="space-y-1">
          <p className="text-2xl lg:text-3xl font-bold">{value}</p>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onClick && (
          <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
            Vai
            <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title, value, trend, trendDirection = 'neutral', icon: Icon, iconColor = 'text-green-600', bgColor = 'bg-green-100'
}: {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  bgColor?: string;
}) {
  const trendIcon = trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> :
                    trendDirection === 'down' ? <TrendingDown className="w-3 h-3" /> : null;
  const trendColorClass = trendDirection === 'up' ? 'text-green-600' :
                          trendDirection === 'down' ? 'text-red-600' :
                          'text-muted-foreground';

  return (
    <Card>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColorClass}`}>
              {trendIcon}
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl lg:text-3xl font-bold">{value}</p>
          <p className="text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <h2 className="text-lg lg:text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showServizioModal, setShowServizioModal] = useState(false);
  const { metrics, activities, isLoadingMetrics, isLoadingActivities } = useDashboardData();

  const oggiStr = format(new Date(), 'yyyy-MM-dd');
  const ricaviDelta = metrics ? percentDelta(metrics.ricaviMese, metrics.ricaviMeseScorso) : null;
  const teamDisponibili = metrics ? metrics.teamTotale - metrics.teamIndisponibiliOggi : 0;

  return (
    <MainLayout>
      <div className="container mx-auto p-4 lg:p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Benvenuto{profile?.first_name ? `, ${profile.first_name}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">Panoramica operativa di TaxiTime</p>
          </div>
          <Button onClick={() => setShowServizioModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo servizio
          </Button>
        </div>

        {/* SEZIONE 1 - Da gestire ora */}
        <section>
          <SectionTitle icon={AlertCircle} title="Da gestire ora" subtitle="Azioni operative prioritarie" />
          {isLoadingMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
            </div>
          ) : metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionCard
                title="Richieste clienti da confermare"
                value={metrics.richiesteClientiCount}
                subtitle={metrics.richiestaPiuVecchiaMinuti !== null ? formatMinutesToHuman(metrics.richiestaPiuVecchiaMinuti) : undefined}
                icon={AlertCircle}
                iconColor="text-orange-600"
                bgColor="bg-orange-100"
                urgent={metrics.richiesteClientiCount > 0}
                onClick={() => navigate('/servizi?tab=richiesta_cliente')}
              />
              <ActionCard
                title="Servizi da assegnare"
                value={metrics.daAssegnareCount}
                icon={UserCheck}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                onClick={() => navigate('/servizi?tab=da_assegnare')}
              />
              <ActionCard
                title="Servizi oggi"
                value={metrics.serviziOggiTotali}
                subtitle={`${metrics.serviziOggiAssegnati} assegnati · ${metrics.serviziOggiCompletati} completati`}
                icon={Calendar}
                iconColor="text-green-600"
                bgColor="bg-green-100"
                onClick={() => navigate(`/servizi?data=${oggiStr}`)}
              />
            </div>
          )}
        </section>

        {/* SEZIONE 2 - Performance mese */}
        <section>
          <SectionTitle icon={BarChart3} title="Performance mese" subtitle="Andamento del mese corrente" />
          {isLoadingMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
            </div>
          ) : metrics && ricaviDelta && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Ricavi mese"
                value={formatCurrency(metrics.ricaviMese)}
                trend={ricaviDelta.label}
                trendDirection={ricaviDelta.direction}
                icon={DollarSign}
                iconColor="text-green-600"
                bgColor="bg-green-100"
              />
              <MetricCard
                title="Servizi completati"
                value={`${metrics.serviziCompletatiMese}`}
                icon={CheckCircle2}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
              />
              <MetricCard
                title="Scostamento incasso"
                value={formatCurrency(metrics.scostamentoIncassoMese)}
                trend={metrics.scostamentoIncassoMese >= 0 ? 'Superato il preventivo' : 'Sotto preventivo'}
                trendDirection={metrics.scostamentoIncassoMese > 0 ? 'up' : metrics.scostamentoIncassoMese < 0 ? 'down' : 'neutral'}
                icon={Wallet}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
            </div>
          )}
        </section>

        {/* SEZIONE 3 - Team & Fleet */}
        <section>
          <SectionTitle icon={Users} title="Team & Fleet" subtitle="Risorse disponibili" />
          {isLoadingMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-36" />)}
            </div>
          ) : metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Team disponibile oggi"
                value={`${teamDisponibili} / ${metrics.teamTotale}`}
                trend={metrics.teamIndisponibiliOggi > 0 ? `${metrics.teamIndisponibiliOggi} indisponibili` : 'Tutti operativi'}
                trendDirection={metrics.teamIndisponibiliOggi > 0 ? 'down' : 'neutral'}
                icon={Users}
                iconColor="text-indigo-600"
                bgColor="bg-indigo-100"
              />
              <MetricCard
                title="Veicoli attivi"
                value={`${metrics.veicoliAttivi}`}
                icon={Car}
                iconColor="text-purple-600"
                bgColor="bg-purple-100"
              />
            </div>
          )}
        </section>

        {/* SEZIONE 4 - Attività recente */}
        <section>
          <SectionTitle icon={Activity} title="Attività recente" subtitle="Ultime operazioni nel sistema" />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ultime attività</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nessuna attività recente</p>
              ) : (
                <div className="space-y-3">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          a.type === 'servizio' ? 'bg-blue-100 text-blue-600' :
                          a.type === 'turno' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {a.type === 'servizio' ? <Calendar className="w-4 h-4" /> :
                           a.type === 'turno' ? <Clock className="w-4 h-4" /> :
                           <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.event}</p>
                          <p className="text-xs text-muted-foreground">{a.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <InserimentoServizioModal open={showServizioModal} onClose={() => setShowServizioModal(false)} />
      </div>
    </MainLayout>
  );
}
