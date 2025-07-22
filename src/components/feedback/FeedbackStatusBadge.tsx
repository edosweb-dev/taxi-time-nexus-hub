import { Badge } from '@/components/ui/badge';

interface FeedbackStatusBadgeProps {
  status: string;
}

const statusConfig = {
  nuovo: { label: 'Nuovo', variant: 'destructive' as const },
  in_lavorazione: { label: 'In Lavorazione', variant: 'secondary' as const },
  risolto: { label: 'Risolto', variant: 'default' as const },
  chiuso: { label: 'Chiuso', variant: 'outline' as const },
};

export function FeedbackStatusBadge({ status }: FeedbackStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.nuovo;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}