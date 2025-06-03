
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { getInitials, getRuoloBadge } from '../TabellaStipendi/utils';
import { Stipendio } from '@/lib/api/stipendi';

interface ModificaStipendioHeaderProps {
  stipendio: Stipendio;
  months: string[];
}

export function ModificaStipendioHeader({ stipendio, months }: ModificaStipendioHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {getInitials(stipendio.user?.first_name, stipendio.user?.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-lg">
              {stipendio.user?.first_name} {stipendio.user?.last_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {getRuoloBadge(stipendio.tipo_calcolo)}
              <Badge variant={stipendio.stato === 'bozza' ? 'secondary' : 'default'}>
                {stipendio.stato}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {months[stipendio.mese - 1]} {stipendio.anno}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
