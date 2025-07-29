import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { useShifts } from './ShiftContext';
import { useUsers } from '@/hooks/useUsers';
import { subDays, isAfter, parseISO } from 'date-fns';

export function ShiftsStats() {
  const { shifts } = useShifts();
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });

  // Calculate statistics
  const today = new Date();
  const weekAgo = subDays(today, 7);
  
  const totalShifts = shifts.length;
  const todayShifts = shifts.filter(s => 
    parseISO(s.shift_date).toDateString() === today.toDateString()
  ).length;
  
  const upcomingShifts = shifts.filter(s => 
    isAfter(parseISO(s.shift_date), today)
  ).length;
  
  const sickLeaves = shifts.filter(s => 
    s.shift_type === 'sick_leave' && 
    isAfter(parseISO(s.shift_date), weekAgo)
  ).length;

  const stats = [
    {
      title: 'Turni Oggi',
      value: todayShifts,
      icon: Calendar,
      description: 'Turni programmati per oggi',
      variant: 'default' as const,
    },
    {
      title: 'Turni Futuri',
      value: upcomingShifts,
      icon: Clock,
      description: 'Turni programmati',
      variant: 'secondary' as const,
    },
    {
      title: 'Totale Turni',
      value: totalShifts,
      icon: Users,
      description: 'Tutti i turni nel sistema',
      variant: 'outline' as const,
    },
    {
      title: 'Malattie (7gg)',
      value: sickLeaves,
      icon: AlertCircle,
      description: 'Malattie negli ultimi 7 giorni',
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge variant={stat.variant} className="text-xs">
                {stat.variant === 'destructive' && stat.value > 0 ? 'Alto' : 
                 stat.variant === 'default' && stat.value > 0 ? 'Attivo' : 'Normale'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}