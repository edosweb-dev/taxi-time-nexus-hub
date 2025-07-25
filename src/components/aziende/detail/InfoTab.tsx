
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Azienda, Profile } from '@/lib/types';
import { 
  Building2, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Users,
  User,
  ExternalLink
} from 'lucide-react';

interface InfoTabProps {
  azienda: Azienda;
  referenti?: Profile[];
  onManageReferenti?: () => void;
}

export function InfoTab({ azienda, referenti = [], onManageReferenti }: InfoTabProps) {
  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 xl:grid-cols-6">
      {/* Main Information Card */}
      <Card className="lg:col-span-2 xl:col-span-3 border-l-4 border-l-primary shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Informazioni Principali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome Azienda</p>
                  <p className="text-sm font-semibold text-foreground">{azienda.nome}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Partita IVA</p>
                  <p className="text-sm font-mono font-medium text-foreground">{azienda.partita_iva}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card className="lg:col-span-1 xl:col-span-2 border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-500" />
            Contatti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Email principale */}
          <div className="space-y-2">
            {azienda.email && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{azienda.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => window.open(`mailto:${azienda.email}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {azienda.emails && azienda.emails.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Email Aggiuntive</p>
                {azienda.emails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between group ml-6">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                        <Mail className="h-3 w-3" />
                      </div>
                      <p className="text-base">{email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(`mailto:${email}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Telefoni principali e aggiuntivi */}
          <div className="space-y-3">
            {azienda.telefono && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Telefono</p>
                    <p className="text-sm font-medium text-foreground">{azienda.telefono}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => window.open(`tel:${azienda.telefono}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}

            {azienda.indirizzo && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Indirizzo</p>
                  <p className="text-sm font-medium text-foreground">{azienda.indirizzo}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referenti Card */}
      <Card className="lg:col-span-2 xl:col-span-3 border-l-4 border-l-green-500 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Referenti ({referenti.length})
            </CardTitle>
            {onManageReferenti && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageReferenti}
                className="flex items-center gap-2 text-xs"
              >
                <Users className="h-3.5 w-3.5" />
                Gestisci
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {referenti.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nessun referente associato a questa azienda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {referenti.slice(0, 3).map((referente) => (
                <div key={referente.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getUserInitials(referente.first_name, referente.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-sm text-foreground">
                      {referente.first_name && referente.last_name 
                        ? `${referente.first_name} ${referente.last_name}`
                        : referente.first_name || referente.last_name || 'Nome non specificato'
                      }
                    </p>
                    {referente.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{referente.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs py-0.5 px-2">
                    Referente
                  </Badge>
                </div>
              ))}
              
              {referenti.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onManageReferenti}
                    className="text-sm text-muted-foreground"
                  >
                    Visualizza tutti i {referenti.length} referenti
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Settings Card */}
      <Card className="lg:col-span-1 xl:col-span-2 border-l-4 border-l-amber-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Configurazioni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${azienda.firma_digitale_attiva ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {azienda.firma_digitale_attiva ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <p className="font-medium">Firma Digitale</p>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  {azienda.firma_digitale_attiva 
                    ? "I servizi richiedono firma digitale obbligatoria"
                    : "Firma digitale non richiesta per i servizi"
                  }
                </p>
              </div>
              <Badge 
                variant={azienda.firma_digitale_attiva ? "default" : "secondary"}
                className={azienda.firma_digitale_attiva ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
              >
                {azienda.firma_digitale_attiva ? "Attiva" : "Disattivata"}
              </Badge>
            </div>
          </div>

          {azienda.provvigione && (
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="font-medium">Sistema Provvigioni</p>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    Calcolo automatico delle provvigioni abilitato
                  </p>
                </div>
                <Badge 
                  variant="default"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                >
                  Attivo
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card className="lg:col-span-4 xl:col-span-6 border-l-4 border-l-gray-400 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="p-2 rounded-lg bg-gray-100">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Azienda creata il</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(azienda.created_at).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
