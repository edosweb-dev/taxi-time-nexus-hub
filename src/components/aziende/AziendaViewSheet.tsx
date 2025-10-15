import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Azienda } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Calendar,
  Edit,
  ExternalLink,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReferenti } from "@/hooks/useReferenti";
import { ReferentiSheet } from "./ReferentiSheet";
import { UserSheet } from "@/components/users/UserSheet";
import { UserFormData } from "@/lib/api/users/types";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";

interface AziendaViewSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (azienda: Azienda) => void;
  azienda: Azienda | null;
}

export function AziendaViewSheet({
  isOpen,
  onOpenChange,
  onEdit,
  azienda,
}: AziendaViewSheetProps) {
  const navigate = useNavigate();
  const [isReferentiSheetOpen, setIsReferentiSheetOpen] = useState(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  
  // Recupera i referenti dell'azienda
  const { data: referenti = [], refetch: refetchReferenti } = useReferenti(azienda?.id);
  const { createUser, isCreating } = useUsers();
  
  if (!azienda) return null;

  // Helper function to get company initials
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const handleEdit = () => {
    onEdit(azienda);
    onOpenChange(false);
  };

  const handleManageReferenti = () => {
    if (referenti.length === 0) {
      // Se non ci sono referenti, apri direttamente il form
      setIsUserSheetOpen(true);
    } else {
      // Se ci sono referenti, apri la sidebar di gestione
      setIsReferentiSheetOpen(true);
    }
  };

  const handleSubmitUser = async (userData: UserFormData) => {
    try {
      await createUser({
        ...userData,
        azienda_id: azienda.id,
        role: 'cliente' as const,
      });
      setIsUserSheetOpen(false);
      refetchReferenti();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getCompanyInitials(azienda.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <SheetTitle className="section-title">
                {azienda.nome}
              </SheetTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="font-mono text-sm">{azienda.partita_iva}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageReferenti}
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              >
                <Users className="h-4 w-4" />
                Gestisci Referenti
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              >
                <Edit className="h-4 w-4" />
                Modifica
              </Button>
            </div>
          </div>
          
          <SheetDescription className="text-left">
            Visualizzazione completa delle informazioni aziendali e configurazioni attive
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 pt-6">
          {/* Contact Information Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
            <CardTitle className="card-title flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                Informazioni di Contatto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email principali (legacy e nuove) */}
              <div className="space-y-3">
                {azienda.email && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Principale</p>
                        <p className="text-base">{azienda.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(`mailto:${azienda.email}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
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
                
                {!azienda.email && (!azienda.emails || azienda.emails.length === 0) && (
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">Nessuna email specificata</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Telefoni principali (legacy e nuovi) */}
              <div className="space-y-3">
                {azienda.telefono && (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Telefono Principale</p>
                        <p className="text-base">{azienda.telefono}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(`tel:${azienda.telefono}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {azienda.telefoni && azienda.telefoni.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Telefoni Aggiuntivi</p>
                    {azienda.telefoni.map((telefono, index) => (
                      <div key={index} className="flex items-center justify-between group ml-6">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-full bg-green-100 text-green-600">
                            <Phone className="h-3 w-3" />
                          </div>
                          <p className="text-base">{telefono}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(`tel:${telefono}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {!azienda.telefono && (!azienda.telefoni || azienda.telefoni.length === 0) && (
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefono</p>
                      <p className="text-sm text-muted-foreground">Nessun telefono specificato</p>
                    </div>
                  </div>
                )}
              </div>

              {azienda.indirizzo ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Indirizzo</p>
                    <p className="text-base">{azienda.indirizzo}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Indirizzo</p>
                    <p className="text-sm text-muted-foreground">Non specificato</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referenti Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="card-title flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Referenti Aziendali
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageReferenti}
                  className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                >
                  <Users className="h-4 w-4" />
                  {referenti.length === 0 ? 'Aggiungi Referenti' : 'Gestisci Referenti'}
                </Button>
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
                <div className="space-y-3">
                  {referenti.slice(0, 3).map((referente) => (
                    <div key={referente.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getUserInitials(referente.first_name, referente.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">
                          {referente.first_name && referente.last_name 
                            ? `${referente.first_name} ${referente.last_name}`
                            : referente.first_name || referente.last_name || 'Nome non specificato'
                          }
                        </p>
                        {referente.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{referente.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        Referente
                      </Badge>
                    </div>
                  ))}
                  
                  {referenti.length > 3 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManageReferenti}
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
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-4">
              <CardTitle className="card-title flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Configurazioni Azienda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${azienda.provvigione ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {azienda.provvigione ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <p className="font-medium">Sistema Provvigioni</p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      {azienda.provvigione 
                        ? "Calcolo automatico delle provvigioni abilitato"
                        : "Calcolo provvigioni non attivo per questa azienda"
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={azienda.provvigione ? "default" : "secondary"}
                    className={azienda.provvigione ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}
                  >
                    {azienda.provvigione ? "Attivo" : "Disattivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          {azienda.created_at && (
            <Card className="border-l-4 border-l-gray-400">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Azienda creata il</p>
                    <p className="text-base">
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
          )}
        </div>
      </SheetContent>
      
      {/* Sidebar annidata per i referenti */}
      <ReferentiSheet
        isOpen={isReferentiSheetOpen}
        onOpenChange={setIsReferentiSheetOpen}
        azienda={azienda}
      />

      {/* Sheet per aggiungere nuovo referente */}
      <UserSheet
        isOpen={isUserSheetOpen}
        onOpenChange={setIsUserSheetOpen}
        onSubmit={handleSubmitUser}
        user={null}
        isSubmitting={isCreating}
        formType="client"
        preselectedAzienda={azienda}
      />
    </Sheet>
  );
}