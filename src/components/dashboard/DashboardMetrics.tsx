import React from 'react';
import { Calendar, DollarSign, Car, Users } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

function MetricCard({ title, value, trend, trendDirection = 'neutral', icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <TrendingUp className="trend-icon trend-up" />;
      case 'down': return <TrendingDown className="trend-icon trend-down" />;
      default: return <Minus className="trend-icon trend-neutral" />;
    }
  };

  const getTrendColorClass = () => {
    switch (trendDirection) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-neutral';
    }
  };

  return (
    <div className="metric-card">
      <div className="metric-header">
        <p className="metric-title">{title}</p>
        <div className="metric-icon">{icon}</div>
      </div>
      
      <div className="metric-content">
        <p className="metric-value">{value}</p>
        {trend && (
          <div className="metric-trend">
            {getTrendIcon()}
            <span className={`trend-text ${getTrendColorClass()}`}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardMetrics() {
  return (
    <div className="dashboard-metrics">
      <div className="metrics-grid">
        <MetricCard
          title="Servizi Oggi"
          value="12"
          trend="+3"
          trendDirection="up"
          icon={<Calendar />}
        />
        <MetricCard
          title="Ricavi Mese"
          value="€2.8K"
          trend="+12%"
          trendDirection="up"
          icon={<DollarSign />}
        />
        <MetricCard
          title="Veicoli"
          value="8"
          trend="0"
          trendDirection="neutral"
          icon={<Car />}
        />
        <MetricCard
          title="Online"
          value="24"
          trend="+5"
          trendDirection="up"
          icon={<Users />}
        />
      </div>
    </div>
  );
}