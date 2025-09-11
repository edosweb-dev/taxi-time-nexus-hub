import React from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Car, Users } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

function MetricCard({ title, value, trend, trendDirection = 'neutral', icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
        {icon}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-foreground">{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${getTrendColor()}`}>
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Servizi Oggi"
        value="12"
        trend="+3"
        trendDirection="up"
        icon={<Calendar className="w-4 h-4 text-primary" />}
      />
      <MetricCard
        title="Ricavi Mese"
        value="€2,840"
        trend="+12%"
        trendDirection="up"
        icon={<DollarSign className="w-4 h-4 text-green-600" />}
      />
      <MetricCard
        title="Veicoli Attivi"
        value="8"
        trend="0"
        trendDirection="neutral"
        icon={<Car className="w-4 h-4 text-blue-600" />}
      />
      <MetricCard
        title="Utenti Online"
        value="24"
        trend="+5"
        trendDirection="up"
        icon={<Users className="w-4 h-4 text-purple-600" />}
      />
    </div>
  );
}