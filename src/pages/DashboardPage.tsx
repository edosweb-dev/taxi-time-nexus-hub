
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
      <div className="dashboard-container">
        
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <h1>Dashboard</h1>
          <p>Benvenuto, {fullName}</p>
        </div>

        {/* KPI Metrics */}
        <DashboardMetrics />

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-cards-grid">
            {dashboardCards.map((card, index) => (
              <div key={index} className="dashboard-card" onClick={card.onClick}>
                <div className="dashboard-card-header">
                  <card.icon className="dashboard-card-icon" />
                  <h3 className="dashboard-card-title">{card.title}</h3>
                </div>
                <p className="dashboard-card-content">
                  {isMobile && card.shortContent ? card.shortContent : card.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Solo mobile */}
        {isMobile && <QuickActions />}
      </div>
    </MainLayout>
  );
}
