import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, FileText, Clock, Users } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const quickActions = [
    {
      title: 'Nuovo Servizio',
      icon: FileText,
      action: () => navigate('/nuovo-servizio'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Calendario',
      icon: Calendar,
      action: () => navigate('/calendario-servizi'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Turni',
      icon: Clock,
      action: () => navigate('/calendario-turni'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    ...(isAdminOrSocio ? [{
      title: 'Utenti',
      icon: Users,
      action: () => navigate('/users'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    }] : [])
  ];

  if (!isMobile) {
    return null; // Solo su mobile
  }

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center text-primary">
          Azioni Rapide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex flex-col gap-1 border-dashed hover:bg-muted/50"
              onClick={action.action}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}