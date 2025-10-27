import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, FileText, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InserimentoServizioModal } from '@/components/servizi/InserimentoServizioModal';

interface QuickAction {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

export function QuickActions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const quickActions: QuickAction[] = [
    {
      title: 'Nuovo Servizio',
      icon: FileText,
      action: () => setShowModal(true),
      variant: 'primary',
    },
    {
      title: 'Calendario',
      icon: Calendar,
      action: () => navigate('/calendario-servizi'),
      variant: 'success',
    },
    {
      title: 'Turni',
      icon: Clock,
      action: () => navigate('/calendario-turni'),
      variant: 'secondary',
    },
    ...(isAdminOrSocio ? [{
      title: 'Utenti',
      icon: Users,
      action: () => navigate('/users'),
      variant: 'warning' as const,
    }] : [])
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'border-primary/30 hover:bg-primary/10 text-primary';
      case 'success':
        return 'border-green-200 hover:bg-green-50 text-green-700';
      case 'warning':
        return 'border-orange-200 hover:bg-orange-50 text-orange-700';
      default:
        return 'border-muted-foreground/30 hover:bg-muted/50 text-muted-foreground';
    }
  };

  return (
    <>
      <div className="md:hidden"> {/* Solo su mobile */}
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center text-primary font-semibold">
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-16 flex flex-col gap-1.5 border-dashed transition-all duration-200 active:scale-95",
                    getVariantStyles(action.variant)
                  )}
                  onClick={action.action}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}