import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, MessageSquare, Clock } from 'lucide-react';

// Componente Metrica Semplice
function MetricCard({ title, value, trend, trendType }: { title: string; value: string; trend?: string; trendType?: 'up' | 'down' | 'neutral'; }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <p className="metric-title">{title}</p>
      </div>
      <p className="metric-value">{value}</p>
      {trend && (
        <p className={`metric-trend trend-${trendType ?? 'neutral'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}

// Componente Card Dashboard Semplice
function SimpleDashboardCard({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; }) {
  return (
    <div className="dashboard-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="dashboard-card-header">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="dashboard-card-title">{title}</h3>
      </div>
      <p className="dashboard-card-content">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Utente';

  const metrics = [
    { title: 'Servizi Oggi', value: '12', trend: '+3', trendType: 'up' as const },
    { title: 'Ricavi Mese', value: '€2.8K', trend: '+12%', trendType: 'up' as const },
    { title: 'Veicoli', value: '8', trend: '0', trendType: 'neutral' as const },
    { title: 'Online', value: '24', trend: '+5', trendType: 'up' as const },
  ];

  const cards = [
    { title: 'Gestione Utenti', description: 'Gestisci utenti, ruoli e permessi', icon: Users, onClick: () => navigate('/users') },
    { title: 'Gestione Aziende', description: 'Gestisci aziende clienti e contratti', icon: Building2, onClick: () => navigate('/aziende') },
    { title: 'Gestione Feedback', description: 'Gestisci feedback degli utenti', icon: MessageSquare, onClick: () => navigate('/feedback') },
    { title: 'Turni', description: 'Visualizza e gestisci i turni', icon: Clock, onClick: () => navigate('/calendario-turni') },
  ];

  return (
    <MainLayout title="Dashboard" showBottomNav={true}>
      <div className="dashboard-container">
        {/* Welcome */}
        <div className="dashboard-welcome">
          <h1>Dashboard</h1>
          <p>Benvenuto, {fullName}</p>
        </div>

        {/* Metrics */}
        <div className="dashboard-metrics">
          {metrics.map((m, i) => (
            <MetricCard key={i} title={m.title} value={m.value} trend={m.trend} trendType={m.trendType} />
          ))}
        </div>

        {/* Cards */}
        <div className="dashboard-cards">
          {cards.map((c, i) => (
            <SimpleDashboardCard key={i} title={c.title} description={c.description} icon={c.icon} onClick={c.onClick} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
