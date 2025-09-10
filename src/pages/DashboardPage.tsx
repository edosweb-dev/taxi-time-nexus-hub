
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, Clock, Users, Building, MessageCircle } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
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
        content: 'Gestisci i profili degli utenti e i loro permessi.',
        buttonText: 'Vai alla gestione utenti',
        icon: Users,
        onClick: handleNavigate('/users'),
        isPrimary: true,
      },
      {
        title: 'Gestione Aziende',
        description: 'Gestisci le aziende clienti',
        content: 'Gestisci le aziende clienti e i loro referenti.',
        buttonText: 'Vai alla gestione aziende',
        icon: Building,
        onClick: handleNavigate('/aziende'),
        isPrimary: true,
      },
      {
        title: 'Gestione Feedback',
        description: 'Visualizza e gestisci i feedback utenti',
        content: 'Gestisci i feedback ricevuti dagli utenti della piattaforma.',
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
      content: 'Visualizza e gestisci i turni di lavoro del personale.',
      buttonText: 'Vai ai turni',
      icon: Calendar,
      onClick: handleNavigate('/calendario-turni'),
      isPrimary: true,
    },
    {
      title: 'Spese Aziendali',
      description: 'Gestisci le spese aziendali',
      content: 'Monitora e gestisci le spese aziendali.',
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
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className={`font-bold tracking-tight text-enhanced ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>
            Dashboard
          </h1>
          <p className={`text-muted-foreground text-enhanced ${
            isMobile ? 'text-base' : 'text-xl'
          }`}>
            Benvenuto, {fullName}
          </p>
        </div>

        {/* Quick Actions - Solo su mobile */}
        {isMobile && <QuickActions />}

        {/* Dashboard Cards */}
        <DashboardGrid>
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              content={card.content}
              buttonText={card.buttonText}
              icon={card.icon}
              onClick={card.onClick}
              isPrimary={card.isPrimary}
              variant={card.variant}
            />
          ))}
        </DashboardGrid>
      </div>
    </MainLayout>
  );
}
