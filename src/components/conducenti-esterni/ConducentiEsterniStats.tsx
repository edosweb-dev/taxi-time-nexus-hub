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

  return null;
}