import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InserimentoServizioModal } from '@/components/servizi/InserimentoServizioModal';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Clock, 
  Calendar,
  DollarSign,
  Car,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Componente Metric Card moderno
function MetricCard({ 
  title, 
  value, 
  trend, 
  trendDirection = 'neutral', 
  icon: Icon,
  description,
  color = 'blue'
}: {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-4 sm:p-6 border border-border/20 rounded-lg">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-1.5 sm:p-2 rounded-lg ${getIconColor()}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-xs sm:text-sm font-medium ${getTrendColor()}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Quick Action Card
function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'primary'
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-gradient-to-br from-card to-card/80 active:scale-95"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-6 sm:border-2 sm:border-primary/20 sm:bg-gradient-to-br sm:from-primary/5 sm:to-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { metrics: dashboardMetrics, activities, isLoading } = useDashboardData();

  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Utente';

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // Calcolo trend
  const diffServizi = (dashboardMetrics?.serviziOggi || 0) - (dashboardMetrics?.serviziIeri || 0);
  const trendServizi = diffServizi >= 0 ? `+${diffServizi}` : `${diffServizi}`;
  const trendDirectionServizi = diffServizi > 0 ? 'up' : diffServizi < 0 ? 'down' : 'neutral';

  const diffRicavi = dashboardMetrics?.ricaviMese && dashboardMetrics?.ricaviMeseScorso
    ? ((dashboardMetrics.ricaviMese - dashboardMetrics.ricaviMeseScorso) / dashboardMetrics.ricaviMeseScorso) * 100
    : 0;
  const trendRicavi = diffRicavi > 0 ? `+${diffRicavi.toFixed(0)}%` : `${diffRicavi.toFixed(0)}%`;
  const trendDirectionRicavi = diffRicavi > 0 ? 'up' : diffRicavi < 0 ? 'down' : 'neutral';

  const metrics = [
    {
      title: 'Servizi Oggi',
      value: isLoading ? '...' : `${dashboardMetrics?.serviziOggi || 0}`,
      trend: trendServizi,
      trendDirection: trendDirectionServizi as 'up' | 'down' | 'neutral',
      icon: Calendar,
      description: 'Rispetto a ieri',
      color: 'blue' as const
    },
    {
      title: 'Ricavi Mensili',
      value: isLoading ? '...' : `€${(dashboardMetrics?.ricaviMese || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      trend: trendRicavi,
      trendDirection: trendDirectionRicavi as 'up' | 'down' | 'neutral',
      icon: DollarSign,
      description: 'Vs mese scorso',
      color: 'green' as const
    },
    {
      title: 'Veicoli Attivi',
      value: isLoading ? '...' : `${dashboardMetrics?.veicoliAttivi || 0}`,
      trend: '0',
      trendDirection: 'neutral' as const,
      icon: Car,
      description: 'Flotta operativa',
      color: 'purple' as const
    },
    {
      title: 'Totale Utenti',
      value: isLoading ? '...' : `${dashboardMetrics?.totaleUtenti || 0}`,
      trend: undefined,
      trendDirection: 'neutral' as const,
      icon: Users,
      description: 'Utenti registrati',
      color: 'orange' as const
    }
  ];

  const quickActions = [
    ...(isAdminOrSocio ? [
      {
        title: 'Gestione Utenti',
        description: 'Amministra utenti e permessi',
        icon: Users,
        onClick: () => navigate('/users')
      },
      {
        title: 'Gestione Aziende',
        description: 'Clienti e contratti',
        icon: Building2,
        onClick: () => navigate('/aziende')
      },
      {
        title: 'Feedback Utenti',
        description: 'Recensioni e suggerimenti',
        icon: MessageSquare,
        onClick: () => navigate('/feedback')
      }
    ] : []),
    {
      title: 'Turni di Lavoro',
      description: 'Pianifica e organizza',
      icon: Clock,
      onClick: () => navigate('/calendario-turni')
    },
    {
      title: 'Analytics',
      description: 'Report e statistiche',
      icon: BarChart3,
      onClick: () => navigate('/analytics')
    },
    {
      title: 'Nuovo Servizio',
      description: 'Crea una nuova prenotazione',
      icon: Zap,
      onClick: () => setShowModal(true)
    }
  ];

  return (
    <MainLayout title="Dashboard" showBottomNav={true}>
      <div className="space-y-4 lg:space-y-12 p-4 lg:p-8 lg:max-w-7xl lg:mx-auto">
        {/* Header Hero Section */}
        <div className="space-y-3 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-8 p-4 lg:p-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5 rounded-xl border border-border/30 shadow-sm backdrop-blur-sm">
            <div className="lg:space-y-2">
              <h1 className="text-2xl lg:text-5xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-base lg:text-xl text-muted-foreground">
                Benvenuto, {fullName}
              </p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 lg:gap-4">
              <Badge variant="secondary" className="text-xs lg:text-sm lg:px-3 lg:py-1 bg-muted text-muted-foreground border-border/50">
                {profile?.role === 'admin' ? 'Amministratore' : 
                 profile?.role === 'socio' ? 'Socio' : 'Utente'}
              </Badge>
              <Button 
                variant="default" 
                size="sm" 
                className="lg:size-default lg:px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                onClick={() => navigate('/profile')}
              >
                Il mio Profilo
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              trendDirection={metric.trendDirection}
              icon={metric.icon}
              description={metric.description}
              color={metric.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions Section */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-2xl font-semibold text-foreground">
                Azioni Rapide
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 h-full">
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                  <Activity className="w-4 h-4 lg:w-6 lg:h-6 text-primary" />
                  Attività Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="space-y-3 lg:space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 lg:py-4">
                        <div className="flex items-center gap-2 lg:gap-4 flex-1">
                          <Skeleton className="w-2 h-2 lg:w-3 lg:h-3 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 lg:h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-3 lg:h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nessuna attività recente</p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between py-2 lg:py-4 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 lg:gap-4">
                          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                            activity.type === 'servizio' ? 'bg-blue-500' :
                            activity.type === 'turno' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}></div>
                          <div>
                            <p className="text-xs lg:text-sm font-medium">{activity.event}</p>
                            <p className="text-xs lg:text-sm text-muted-foreground">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs lg:text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </MainLayout>
  );
}