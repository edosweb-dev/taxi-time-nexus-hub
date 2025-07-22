
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, Bug, Lightbulb, Zap, User, Wrench, Plus, Filter } from 'lucide-react';
import { FeedbackStatusBadge } from '@/components/feedback/FeedbackStatusBadge';
import { FeedbackUpdateDialog } from '@/components/feedback/FeedbackUpdateDialog';
import { FeedbackActions } from '@/components/feedback/FeedbackActions';
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet';
import { useFeedback } from '@/hooks/useFeedback';

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
  status: string;
  admin_comment: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showNewFeedbackSheet, setShowNewFeedbackSheet] = useState(false);
  const { updateFeedback } = useFeedback();

  const { data: feedbacks, isLoading, error, refetch } = useQuery({
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

  const getStatusStats = () => {
    if (!feedbacks) return {};
    
    return feedbacks.reduce((acc, feedback) => {
      acc[feedback.status] = (acc[feedback.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const filteredFeedbacks = feedbacks?.filter(feedback => 
    statusFilter === 'all' || feedback.status === statusFilter
  ) || [];

  const handleQuickStatusChange = async (feedbackId: string, status: string) => {
    try {
      await updateFeedback(feedbackId, { status });
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowUpdateDialog(true);
  };

  const typeStats = getTypeStats();
  const statusStats = getStatusStats();

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback Utenti</h1>
            <p className="text-muted-foreground">
              Visualizza e gestisci i feedback ricevuti dagli utenti
            </p>
          </div>
          <Button onClick={() => setShowNewFeedbackSheet(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Feedback
          </Button>
        </div>

        {/* Statistiche per Tipo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(typeLabels).map(([key, label]) => {
            const Icon = typeIcons[key as keyof typeof typeIcons];
            const count = typeStats[key] || 0;
            
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

        {/* Statistiche per Status */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { key: 'nuovo', label: 'Nuovi', color: 'text-red-600' },
            { key: 'in_lavorazione', label: 'In Lavorazione', color: 'text-blue-600' },
            { key: 'risolto', label: 'Risolti', color: 'text-green-600' },
            { key: 'chiuso', label: 'Chiusi', color: 'text-gray-600' },
          ].map(({ key, label, color }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${color}`}>
                  {statusStats[key] || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtri e Tabella Feedback */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Lista Feedback
                </CardTitle>
                <CardDescription>
                  {filteredFeedbacks.length} di {feedbacks?.length || 0} feedback totali
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="nuovo">Nuovi</SelectItem>
                    <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                    <SelectItem value="risolto">Risolti</SelectItem>
                    <SelectItem value="chiuso">Chiusi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !filteredFeedbacks || filteredFeedbacks.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {statusFilter === 'all' ? 'Nessun feedback ricevuto' : `Nessun feedback con status "${statusFilter}"`}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pagina</TableHead>
                    <TableHead>Messaggio</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell>
                        <FeedbackStatusBadge status={feedback.status} />
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
                        <div className="space-y-1">
                          <div className="truncate" title={feedback.messaggio}>
                            {feedback.messaggio}
                          </div>
                          {feedback.admin_comment && (
                            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                              <strong>Admin:</strong> {feedback.admin_comment}
                            </div>
                          )}
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
                      <TableCell>
                        <FeedbackActions
                          feedback={feedback}
                          onEdit={handleEditFeedback}
                          onQuickStatusChange={handleQuickStatusChange}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Dialogs */}
        <FeedbackUpdateDialog
          feedback={selectedFeedback}
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          onUpdate={refetch}
        />
        
        <FeedbackSheet
          open={showNewFeedbackSheet}
          onOpenChange={setShowNewFeedbackSheet}
        />
      </div>
    </MainLayout>
  );
}
