import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, User, Mail, Phone, Building2, Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';
import { usePasseggeriByReferente } from '@/hooks/useReferentiPasseggeri';
import { PasseggeriList } from '@/components/referenti/PasseggeriList';

export default function ReferenteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch referente details
  const { data: referente, isLoading: isLoadingReferente } = useQuery({
    queryKey: ['referente', id],
    queryFn: async () => {
      if (!id) throw new Error('ID referente mancante');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching referente:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Referente non trovato');
      }

      return {
        ...data,
        role: data.role as UserRole
      } as Profile;
    },
    enabled: !!id,
  });

  // Fetch azienda details
  const { data: azienda } = useQuery({
    queryKey: ['azienda', referente?.azienda_id],
    queryFn: async () => {
      if (!referente?.azienda_id) return null;
      
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('id', referente.azienda_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching azienda:', error);
        return null;
      }

      return data;
    },
    enabled: !!referente?.azienda_id,
  });

  // Fetch passeggeri
  const { data: passeggeri = [], isLoading: isLoadingPasseggeri } = usePasseggeriByReferente(id);

  if (isLoadingReferente) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento referente...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!referente) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Referente non trovato</h2>
          <p className="text-muted-foreground mb-6">
            Il referente che stai cercando non esiste o è stato rimosso.
          </p>
          <Button onClick={() => navigate('/aziende')}>
            Torna alle aziende
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">
                {referente.first_name} {referente.last_name}
              </h1>
              <p className="text-description">
                Dettagli referente aziendale
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {referente.role}
              </Badge>
              {azienda && (
                <span className="text-sm text-muted-foreground">
                  {azienda.nome}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
          {/* Informazioni Personali Card - 60% */}
          <Card className="lg:col-span-3 border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                Informazioni Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome Completo</p>
                      <p className="text-base font-bold text-foreground">
                        {referente.first_name} {referente.last_name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ruolo</p>
                      <Badge variant="secondary" className="mt-1">
                        {referente.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contatti */}
              {(referente.email || referente.telefono) && (
                <div className="pt-3 border-t space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {referente.email && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                          <p className="text-base font-semibold text-foreground">{referente.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {referente.telefono && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefono</p>
                          <p className="text-base font-semibold text-foreground">{referente.telefono}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informazioni Azienda Card - 40% */}
          <Card className="lg:col-span-2 border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-500" />
                Azienda di Appartenenza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {azienda ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome Azienda</p>
                      <p className="text-base font-bold text-foreground">{azienda.nome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/30">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Partita IVA</p>
                      <p className="text-sm font-mono font-semibold text-foreground">{azienda.partita_iva}</p>
                    </div>
                  </div>
                  
                  {azienda.citta && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/30">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Città</p>
                        <p className="text-sm font-semibold text-foreground">{azienda.citta}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nessuna azienda associata
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sezione passeggeri */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-500" />
                Passeggeri ({passeggeri.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPasseggeri ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Caricamento passeggeri...
                </p>
              </div>
            ) : (
              <PasseggeriList passeggeri={passeggeri} />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}