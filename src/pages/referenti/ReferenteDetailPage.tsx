import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, User, Mail, Phone, Building2, Users } from 'lucide-react';
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Indietro
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">
              {referente.first_name} {referente.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
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

        {/* Informazioni referente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card principale referente */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informazioni Referente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Nome completo</h3>
                    <p className="text-lg font-semibold">
                      {referente.first_name} {referente.last_name}
                    </p>
                  </div>

                  {referente.email && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </h3>
                      <p className="text-base">
                        {referente.email}
                      </p>
                    </div>
                  )}

                  {referente.telefono && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefono
                      </h3>
                      <p className="text-base">
                        {referente.telefono}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {azienda && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Azienda
                      </h3>
                      <p className="text-base font-medium">
                        {azienda.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        P.IVA: {azienda.partita_iva}
                      </p>
                      {azienda.citta && (
                        <p className="text-sm text-muted-foreground">
                          {azienda.citta}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Ruolo</h3>
                    <Badge variant="secondary" className="mt-1">
                      {referente.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card statistiche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {passeggeri.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Passeggeri collegati
                </p>
              </div>
              
              {passeggeri.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Con email:</span>
                    <span className="font-medium">
                      {passeggeri.filter(p => p.email).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Con telefono:</span>
                    <span className="font-medium">
                      {passeggeri.filter(p => p.telefono).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Con indirizzo:</span>
                    <span className="font-medium">
                      {passeggeri.filter(p => p.indirizzo).length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sezione passeggeri */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Passeggeri
              </h2>
              <Badge variant="outline" className="ml-2">
                {passeggeri.length}
              </Badge>
            </div>
          </div>
          
          {isLoadingPasseggeri ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Caricamento passeggeri...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PasseggeriList passeggeri={passeggeri} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}