import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Building2, User, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Tipo temporaneo - in futuro andrà allineato con i tipi dei servizi
interface Service {
  id: string;
  azienda_nome?: string;
  indirizzo_partenza?: string;
  indirizzo_destinazione?: string;
  orario_partenza?: string;
  orario_arrivo?: string;
  stato: string;
  note?: string;
  telefono_contatto?: string;
  nome_contatto?: string;
}

interface DayServicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  services: Service[];
  isLoading?: boolean;
}

export function DayServicesModal({ 
  open, 
  onOpenChange, 
  date, 
  services, 
  isLoading = false 
}: DayServicesModalProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completato': return 'bg-green-500';
      case 'in_corso': return 'bg-blue-500';
      case 'programmato': return 'bg-amber-500';
      case 'cancellato': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completato': return 'Completato';
      case 'in_corso': return 'In Corso';
      case 'programmato': return 'Programmato';
      case 'cancellato': return 'Cancellato';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Servizi del {date ? format(date, 'dd MMMM yyyy', { locale: it }) : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Caricamento servizi...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nessun servizio trovato</p>
              <p className="text-sm">
                Non ci sono servizi registrati per questo giorno.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {services.length} servizio{services.length > 1 ? 'i' : ''} trovato{services.length > 1 ? 'i' : ''}
                </p>
              </div>

              {services.map((service) => (
                <Card key={service.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {service.azienda_nome || 'Azienda non specificata'}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(service.stato)} text-white`}
                      >
                        {getStatusLabel(service.stato)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Orari */}
                    {(service.orario_partenza || service.orario_arrivo) && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {service.orario_partenza && (
                            <>Partenza: {service.orario_partenza}</>
                          )}
                          {service.orario_partenza && service.orario_arrivo && (
                            <span className="mx-2">•</span>
                          )}
                          {service.orario_arrivo && (
                            <>Arrivo: {service.orario_arrivo}</>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Indirizzi */}
                    <div className="space-y-2">
                      {service.indirizzo_partenza && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Partenza</p>
                            <p className="text-sm text-muted-foreground">{service.indirizzo_partenza}</p>
                          </div>
                        </div>
                      )}

                      {service.indirizzo_destinazione && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Destinazione</p>
                            <p className="text-sm text-muted-foreground">{service.indirizzo_destinazione}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contatto */}
                    {(service.nome_contatto || service.telefono_contatto) && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {service.nome_contatto}
                          {service.nome_contatto && service.telefono_contatto && ' • '}
                          {service.telefono_contatto && (
                            <a 
                              href={`tel:${service.telefono_contatto}`}
                              className="text-primary hover:underline"
                            >
                              {service.telefono_contatto}
                            </a>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Note */}
                    {service.note && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Note: </span>
                          {service.note}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}