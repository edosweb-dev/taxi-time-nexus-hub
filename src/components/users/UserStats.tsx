import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserCog, Building, TrendingUp } from 'lucide-react';
import { Profile } from '@/lib/types';

interface UserStatsProps {
  users: Profile[];
}

export function UserStats({ users }: UserStatsProps) {
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    soci: users.filter(u => u.role === 'socio').length,
    dipendenti: users.filter(u => u.role === 'dipendente').length,
    clienti: users.filter(u => u.role === 'cliente').length,
  };

  const statsConfig = [
    {
      title: "Totale Utenti",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Staff",
      value: stats.admins + stats.soci + stats.dipendenti,
      icon: UserCog,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-500",
      subtitle: `${stats.admins} admin • ${stats.soci} soci • ${stats.dipendenti} dipendenti`
    },
    {
      title: "Clienti",
      value: stats.clienti,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-50", 
      borderColor: "border-l-green-500",
    },
    {
      title: "Crescita",
      value: `+${Math.round((stats.total / Math.max(stats.total - 1, 1)) * 100 - 100)}%`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-500",
      subtitle: "vs mese scorso"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => (
        <Card key={index} className={`${stat.borderColor} border-l-4 hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}