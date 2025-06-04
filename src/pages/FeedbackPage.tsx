
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, Bug, Lightbulb, Zap, User, Wrench } from 'lucide-react';

interface Feedback {
  id: string;
  tipo: string;
  pagina: string;
  messaggio: string;
  email: string | null;
  user_id: string | null;
  url: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at: string;
}

const typeIcons = {
  bug: Bug,
  feature: Lightbulb,
  improvement: Zap,
  usability: User,
  other: Wrench,
};

const typeLabels = {
  bug: '🐛 Bug/Errore',
  feature: '💡 Nuova Funzionalità',
  improvement: '⚡ Miglioramento',
  usability: '👤 Usabilità',
  other: '🔧 Altro',
};

const typeColors = {
  bug: 'destructive',
  feature: 'default',
  improvement: 'secondary',
  usability: 'outline',
  other: 'outline',
} as const;

export default function FeedbackPage() {
  const { data: feedbacks, isLoading, error } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });

  const getTypeStats = () => {
    if (!feedbacks) return {};
    
    return feedbacks.reduce((acc, feedback) => {
      acc[feedback.tipo] = (acc[feedback.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const stats = getTypeStats();

  if (error) {
    return (
      <MainLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-600">Errore</h1>
          <p className="text-muted-foreground">
            Errore nel caricamento dei feedback: {error.message}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Utenti</h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci i feedback ricevuti dagli utenti
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(typeLabels).map(([key, label]) => {
            const Icon = typeIcons[key as keyof typeof typeIcons];
            const count = stats[key] || 0;
            
            return (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabella Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Lista Feedback
            </CardTitle>
            <CardDescription>
              {feedbacks?.length || 0} feedback totali ricevuti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !feedbacks || feedbacks.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Nessun feedback ricevuto
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pagina</TableHead>
                    <TableHead>Messaggio</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeColors[feedback.tipo as keyof typeof typeColors]}>
                          {typeLabels[feedback.tipo as keyof typeof typeLabels] || feedback.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {feedback.pagina}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={feedback.messaggio}>
                          {feedback.messaggio}
                        </div>
                      </TableCell>
                      <TableCell>
                        {feedback.email ? (
                          <a 
                            href={`mailto:${feedback.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {feedback.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {feedback.url ? (
                          <a 
                            href={feedback.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate block max-w-xs"
                            title={feedback.url}
                          >
                            {feedback.url}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
