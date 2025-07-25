
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Home, Eye, Download, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBackups, UserBackup } from '@/lib/api/users';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper functions for safe type casting
const getAsObject = (data: any): any => {
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  return {};
};

const getAsArray = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const getAsString = (data: any): string => {
  if (typeof data === 'string') {
    return data;
  }
  return '';
};

export default function UserBackupsPage() {
  const { profile } = useAuth();
  const [selectedBackup, setSelectedBackup] = useState<UserBackup | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return (
      <MainLayout>
        <div style={{ padding: '10px' }}>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Accesso Negato</h1>
            <p className="text-muted-foreground">Solo gli amministratori possono accedere a questa pagina.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { data: backups = [], isLoading, error } = useQuery({
    queryKey: ['user-backups'],
    queryFn: getUserBackups,
  });

  const handleViewBackup = (backup: UserBackup) => {
    setSelectedBackup(backup);
    setIsViewDialogOpen(true);
  };

  const handleDownloadBackup = (backup: UserBackup) => {
    const userData = getAsObject(backup.user_data);
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-utente-${userData?.first_name || 'utente'}-${userData?.last_name || ''}-${backup.deleted_at.split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ padding: '10px' }}>
          <div className="text-center py-8">
            <p>Caricamento backup...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '10px' }}>
          <div className="text-center py-8">
            <p className="text-destructive">Errore nel caricamento dei backup</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span>Utenti</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Backup Eliminazioni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Backup Eliminazioni Utenti</h1>
                <p className="text-muted-foreground text-lg">
                  Consulta i backup degli utenti eliminati
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Utenti Eliminati
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun backup di eliminazione trovato</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map((backup) => {
                    const userData = getAsObject(backup.user_data);
                    const serviziData = getAsArray(backup.servizi_data);
                    const stipendiData = getAsArray(backup.stipendi_data);
                    const speseData = getAsArray(backup.spese_data);
                    const turniData = getAsArray(backup.turni_data);
                    
                    return (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-foreground">
                              {userData?.first_name || 'N/A'} {userData?.last_name || ''}
                            </h3>
                            <Badge variant="outline">
                              {userData?.role || 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>Eliminato {formatDistanceToNow(new Date(backup.deleted_at), { addSuffix: true, locale: it })}</span>
                            <span>•</span>
                            <span>{serviziData.length} servizi</span>
                            <span>•</span>
                            <span>{stipendiData.length} stipendi</span>
                            <span>•</span>
                            <span>{speseData.length} spese</span>
                            <span>•</span>
                            <span>{turniData.length} turni</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBackup(backup)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizza
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBackup(backup)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Scarica
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        
          {/* Dialog per visualizzazione dettagli backup */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Dettagli Backup - {getAsObject(selectedBackup?.user_data)?.first_name || 'N/A'} {getAsObject(selectedBackup?.user_data)?.last_name || ''}
                </DialogTitle>
              </DialogHeader>
              
              {selectedBackup && (
                <div className="space-y-6">
                  {/* Informazioni generali */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <strong>Nome:</strong> {getAsObject(selectedBackup.user_data)?.first_name || 'N/A'} {getAsObject(selectedBackup.user_data)?.last_name || ''}
                    </div>
                    <div>
                      <strong>Ruolo:</strong> {getAsObject(selectedBackup.user_data)?.role || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {getAsObject(selectedBackup.user_data)?.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Eliminato il:</strong> {new Date(selectedBackup.deleted_at).toLocaleString('it-IT')}
                    </div>
                  </div>

                  {/* Statistiche dati */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Servizi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getAsArray(selectedBackup.servizi_data).length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Stipendi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getAsArray(selectedBackup.stipendi_data).length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Spese</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getAsArray(selectedBackup.spese_data).length}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dati dettagliati in formato JSON (collassabile) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dati Completi (JSON)</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedBackup, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
      </div>
    </MainLayout>
  );
}
