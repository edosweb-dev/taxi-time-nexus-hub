import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

interface ConducentiEsterniStatsProps {
  conducenti: ConducenteEsterno[];
}

export function ConducentiEsterniStats({ conducenti }: ConducentiEsterniStatsProps) {
  const stats = useMemo(() => {
    const totaleConducenti = conducenti.length;
    const conducentiAttivi = conducenti.filter(c => c.attivo).length;
    const conducentiInattivi = totaleConducenti - conducentiAttivi;
    const conEmail = conducenti.filter(c => c.email && c.email.trim() !== '').length;

    return {
      totaleConducenti,
      conducentiAttivi,
      conducentiInattivi,
      conEmail,
    };
  }, [conducenti]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totale Conducenti</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totaleConducenti}</div>
          <p className="text-xs text-muted-foreground">
            Conducenti esterni registrati
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conducenti Attivi</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.conducentiAttivi}</div>
          <p className="text-xs text-muted-foreground">
            Disponibili per servizi
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conducenti Inattivi</CardTitle>
          <UserX className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.conducentiInattivi}</div>
          <p className="text-xs text-muted-foreground">
            Non disponibili
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Con Email</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conEmail}</div>
          <p className="text-xs text-muted-foreground">
            Contattabili via email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}