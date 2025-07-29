
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Azienda, Profile } from '@/lib/types';
import { Passeggero, getPasseggeriByAzienda, getPasseggeriByReferente } from '@/lib/api/passeggeri';
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
  ExternalLink,
  UserCheck,
  Filter
} from 'lucide-react';

interface InfoTabProps {
  azienda: Azienda;
  referenti?: Profile[];
  onAddReferente?: () => void;
  onEditReferente?: (referente: Profile) => void;
  onDeleteReferente?: (referente: Profile) => void;
}

export function InfoTab({ azienda, referenti = [], onAddReferente, onEditReferente, onDeleteReferente }: InfoTabProps) {
  const navigate = useNavigate();
  const [passeggeri, setPasseggeri] = useState<Passeggero[]>([]);
  const [filteredPasseggeri, setFilteredPasseggeri] = useState<Passeggero[]>([]);
  const [selectedReferente, setSelectedReferente] = useState<string>('all');
  const [loadingPasseggeri, setLoadingPasseggeri] = useState(false);

  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  // Load passengers on component mount
  useEffect(() => {
    const loadPasseggeri = async () => {
      try {
        setLoadingPasseggeri(true);
        const data = await getPasseggeriByAzienda(azienda.id);
        setPasseggeri(data);
        setFilteredPasseggeri(data);
      } catch (error) {
        console.error('Error loading passengers:', error);
      } finally {
        setLoadingPasseggeri(false);
      }
    };

    loadPasseggeri();
  }, [azienda.id]);

  // Filter passengers when referente selection changes
  useEffect(() => {
    if (selectedReferente === 'all') {
      setFilteredPasseggeri(passeggeri);
    } else if (selectedReferente === 'none') {
      setFilteredPasseggeri(passeggeri.filter(p => !p.referente_id));
    } else {
      setFilteredPasseggeri(passeggeri.filter(p => p.referente_id === selectedReferente));
    }
  }, [selectedReferente, passeggeri]);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
      {/* Main Information Card - 60% */}
      <Card className="lg:col-span-3 border-l-4 border-l-primary shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            Informazioni Principali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome Azienda</p>
                  <p className="text-base font-bold text-foreground">{azienda.nome}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Partita IVA</p>
                  <p className="text-base font-mono font-bold text-foreground">{azienda.partita_iva}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Indirizzo, Telefono, Città, SDI e PEC - spostati qui dalle informazioni di contatto */}
          {(azienda.indirizzo || azienda.telefono || azienda.citta || azienda.sdi || azienda.pec) && (
            <div className="pt-3 border-t space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {azienda.indirizzo && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Indirizzo</p>
                      <p className="text-base font-semibold text-foreground">{azienda.indirizzo}</p>
                    </div>
                  </div>
                )}
                
                {azienda.telefono && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefono</p>
                      <p className="text-base font-semibold text-foreground">{azienda.telefono}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {azienda.citta && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Città</p>
                      <p className="text-base font-semibold text-foreground">{azienda.citta}</p>
                    </div>
                  </div>
                )}
                
                {azienda.sdi && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Codice SDI</p>
                      <p className="text-base font-semibold text-foreground">{azienda.sdi}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {azienda.pec && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PEC</p>
                    <p className="text-base font-semibold text-foreground">{azienda.pec}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information Card - 40% */}
      <Card className="lg:col-span-2 border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Phone className="h-6 w-6 text-blue-500" />
            Contatti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email principale */}
          <div className="space-y-3">
            {azienda.email && (
              <div className="flex items-center justify-between group p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-foreground">{azienda.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={() => window.open(`mailto:${azienda.email}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {azienda.emails && azienda.emails.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-muted-foreground">Email Aggiuntive</p>
                {azienda.emails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between group p-3 rounded-lg border bg-card/30 ml-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm font-medium">{email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      onClick={() => window.open(`mailto:${email}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referenti Card - 60% */}
      <Card className="lg:col-span-3 border-l-4 border-l-green-500 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Users className="h-6 w-6 text-green-500" />
              Referenti ({referenti.length})
            </CardTitle>
            {onAddReferente && (
              <Button
                onClick={onAddReferente}
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Aggiungi Referente
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
                <div 
                  key={referente.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 group hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/referenti/${referente.id}`)}
                >
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
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditReferente && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditReferente(referente);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <User className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs py-0.5 px-2">
                    Referente
                  </Badge>
                </div>
              ))}
              
              {referenti.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Altri {referenti.length - 3} referenti non mostrati
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Settings Card - 40% */}
      <Card className="lg:col-span-2 border-l-4 border-l-amber-500 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Building2 className="h-6 w-6 text-amber-500" />
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

      {/* Passeggeri Card - Nuovo blocco */}
      <Card className="lg:col-span-5 border-l-4 border-l-purple-500 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-purple-500" />
              Passeggeri ({filteredPasseggeri.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedReferente} onValueChange={setSelectedReferente}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtra per referente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i passeggeri</SelectItem>
                  <SelectItem value="none">Senza referente</SelectItem>
                  {referenti.map((referente) => (
                    <SelectItem key={referente.id} value={referente.id}>
                      {referente.first_name && referente.last_name 
                        ? `${referente.first_name} ${referente.last_name}`
                        : referente.first_name || referente.last_name || 'Nome non specificato'
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPasseggeri ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Caricamento passeggeri...</p>
            </div>
          ) : filteredPasseggeri.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedReferente === 'all' 
                  ? 'Nessun passeggero registrato per questa azienda'
                  : `Nessun passeggero trovato per il filtro selezionato`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredPasseggeri.map((passeggero) => (
                <div key={passeggero.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card/50">
                  <Avatar className="h-10 w-10 border-2 border-purple-200">
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-semibold">
                      {passeggero.nome_cognome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      {passeggero.nome_cognome}
                    </p>
                    {passeggero.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{passeggero.email}</span>
                      </div>
                    )}
                    {passeggero.telefono && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{passeggero.telefono}</span>
                      </div>
                    )}
                    {passeggero.localita && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{passeggero.localita}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Card - 100% */}
      <Card className="lg:col-span-5 border-l-4 border-l-gray-400 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="p-3 rounded-lg bg-gray-100">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Azienda creata il</p>
              <p className="text-base font-bold text-foreground">
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
