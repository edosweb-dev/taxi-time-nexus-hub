
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, Clock, Users, Building, MessageCircle } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Utente';
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleNavigate = (path: string) => () => {
    navigate(path);
  };

  const dashboardCards = [
    // Admin/Socio only cards
    ...(isAdminOrSocio ? [
      {
        title: 'Gestione Utenti',
        description: 'Gestisci gli utenti della piattaforma',
        content: 'Amministra utenti, assegna ruoli e gestisci permessi per autisti, amministratori e clienti della piattaforma.',
        shortContent: 'Gestisci utenti, ruoli e permessi',
        buttonText: 'Vai alla gestione utenti',
        icon: Users,
        onClick: handleNavigate('/users'),
        isPrimary: true,
      },
      {
        title: 'Gestione Aziende',
        description: 'Gestisci le aziende clienti',
        content: 'Visualizza e gestisci le aziende clienti, i loro contratti e le informazioni di fatturazione.',
        shortContent: 'Gestisci aziende clienti e contratti',
        buttonText: 'Vai alla gestione aziende',
        icon: Building,
        onClick: handleNavigate('/aziende'),
        isPrimary: true,
      },
      {
        title: 'Gestione Feedback',
        description: 'Visualizza e gestisci i feedback utenti',
        content: 'Gestisci i feedback ricevuti dagli utenti della piattaforma per migliorare il servizio.',
        shortContent: 'Visualizza e gestisci feedback utenti',
        buttonText: 'Vai ai feedback',
        icon: MessageCircle,
        onClick: handleNavigate('/feedback'),
        isPrimary: true,
      },
    ] : []),
    // Cards for all users
    {
      title: 'Turni',
      description: 'Organizza i turni di lavoro',
      content: 'Visualizza e gestisci i turni di lavoro del personale, assegna autisti e pianifica le attività.',
      shortContent: 'Gestisci turni e pianificazione lavoro',
      buttonText: 'Vai ai turni',
      icon: Calendar,
      onClick: handleNavigate('/calendario-turni'),
      isPrimary: true,
    },
    {
      title: 'Spese Aziendali',
      description: 'Gestisci le spese aziendali',
      content: 'Monitora e gestisci le spese aziendali, carburante, manutenzioni e altri costi operativi.',
      shortContent: 'Monitora spese e costi operativi',
      buttonText: 'Vai alle spese',
      icon: Clock,
      onClick: handleNavigate('/spese-aziendali'),
      isPrimary: false,
      variant: 'outline' as const,
    },
  ];

  return (
    <MainLayout 
      title="Dashboard" 
      showBottomNav={true}
    >
      <div className={`dashboard-page space-y-6 w-full max-w-full overflow-hidden ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Header */}
        <div className="space-y-2 w-full">
          <h1 className={`font-bold tracking-tight ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>
            Dashboard
          </h1>
          <p className={`text-muted-foreground ${
            isMobile ? 'text-base' : 'text-xl'
          }`}>
            Benvenuto, {fullName}
          </p>
        </div>

        {/* KPI Metrics Section */}
        <DashboardMetrics />

        {/* Dashboard Cards */}
        <div className="dashboard-grid w-full max-w-full">
          <DashboardGrid 
            cols={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={isMobile ? "md" : "lg"}
          >
            {dashboardCards.map((card, index) => (
              <div key={index} className="dashboard-card w-full max-w-full">
                <DashboardCard
                  title={card.title}
                  description={card.description}
                  content={card.content}
                  shortContent={card.shortContent}
                  buttonText={card.buttonText}
                  icon={card.icon}
                  onClick={card.onClick}
                  isPrimary={card.isPrimary}
                  variant={card.variant}
                  mobileOptimized={isMobile}
                />
              </div>
            ))}
          </DashboardGrid>
        </div>

        {/* Quick Actions - Solo se necessarie */}
        {isMobile && (
          <div className="quick-actions-container w-full max-w-full">
            <QuickActions />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
