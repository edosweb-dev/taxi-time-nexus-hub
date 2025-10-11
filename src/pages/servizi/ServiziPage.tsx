import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServiziWithPasseggeri, ServizioWithPasseggeri } from "@/hooks/useServiziWithPasseggeri";
import { useAziende } from "@/hooks/useAziende";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// DropdownMenu rimosso - sostituito con icone dirette con tooltip
import { Plus, Calendar, MapPin, Loader2, Search, Filter, Users, CheckCircle, XCircle, FileText, Eye, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Servizio } from "@/lib/types/servizi";
import { AssignmentPopup } from "@/components/servizi/assegnazione/AssignmentPopup";

export default function ServiziPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  
  // REF per container tabs
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  
  const { data: servizi = [], isLoading, error, refetch } = useServiziWithPasseggeri();
  const { aziende = [] } = useAziende();
  const { users = [] } = useUsers();
  
  const [activeTab, setActiveTab] = useState<string>("bozza");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  
  // Check if user is admin or socio
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // FORCE SCROLL LEFT = 0 su mount
  useEffect(() => {
    if (tabsScrollRef.current && isMobile) {
      // Scroll a sinistra immediatamente
      tabsScrollRef.current.scrollLeft = 0;
      
      // Doppio check dopo 100ms (per sicurezza)
      setTimeout(() => {
        if (tabsScrollRef.current) {
          tabsScrollRef.current.scrollLeft = 0;
        }
      }, 100);
    }
  }, [isMobile]);

  // Calculate status counts
  const statusCounts = useMemo(() => ({
    bozza: servizi.filter(s => s.stato === 'bozza').length,
    da_assegnare: servizi.filter(s => s.stato === 'da_assegnare').length,
    assegnato: servizi.filter(s => s.stato === 'assegnato').length,
    non_accettato: servizi.filter(s => s.stato === 'non_accettato').length,
    completato: servizi.filter(s => s.stato === 'completato').length,
    annullato: servizi.filter(s => s.stato === 'annullato').length,
    consuntivato: servizi.filter(s => s.stato === 'consuntivato').length,
  }), [servizi]);

  // Filter servizi by search term
  const searchFilteredServizi = useMemo(() => {
    if (!searchTerm) return servizi;
    const term = searchTerm.toLowerCase();
    return servizi.filter((s: ServizioWithPasseggeri) => {
      return (
        s.aziende?.nome?.toLowerCase().includes(term) ||
        s.numero_commessa?.toLowerCase().includes(term) ||
        s.indirizzo_presa?.toLowerCase().includes(term) ||
        s.indirizzo_destinazione?.toLowerCase().includes(term)
      );
    });
  }, [servizi, searchTerm]);

  // Filter servizi by active tab
  const filteredServizi = useMemo(() => {
    return searchFilteredServizi.filter((s: ServizioWithPasseggeri) => s.stato === activeTab);
  }, [searchFilteredServizi, activeTab]);

  const getStatusColor = (stato: string) => {
    const colors: Record<string, string> = {
      bozza: 'bg-gray-400 text-white',
      da_assegnare: 'bg-yellow-500 text-white',
      assegnato: 'bg-blue-500 text-white',
      non_accettato: 'bg-orange-500 text-white',
      completato: 'bg-green-500 text-white',
      annullato: 'bg-red-500 text-white',
      consuntivato: 'bg-purple-500 text-white'
    };
    return colors[stato] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (stato: string) => {
    const labels: Record<string, string> = {
      bozza: 'Bozza',
      da_assegnare: 'Da Assegnare',
      assegnato: 'Assegnato',
      non_accettato: 'Non Accettato',
      completato: 'Completato',
      annullato: 'Annullato',
      consuntivato: 'Consuntivato'
    };
    return labels[stato] || stato;
  };

  const handleAssignClick = (e: React.MouseEvent, servizio: ServizioWithPasseggeri) => {
    e.stopPropagation();
    setSelectedServizio(servizio as Servizio);
    setShowAssignmentPopup(true);
  };

  const renderMobileCard = (servizio: ServizioWithPasseggeri) => (
    <Card 
      key={servizio.id}
      className="w-full p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/servizi/${servizio.id}`)}
    >
      {/* Card Header: Azienda + Status */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">
            {servizio.tipo_cliente === 'privato' 
              ? `${servizio.cliente_privato_nome || ''} ${servizio.cliente_privato_cognome || ''}`.trim() || 'Cliente Privato'
              : servizio.aziende?.nome || 'N/A'}
          </h3>
          {servizio.numero_commessa && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Commessa: {servizio.numero_commessa}
            </p>
          )}
        </div>
        <Badge className={getStatusColor(servizio.stato)}>
          {getStatusLabel(servizio.stato)}
        </Badge>
      </div>

      {/* Card Body: Info Servizio */}
      <div className="space-y-2 text-sm">
        {/* Data e Orario */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1">
            {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
          </span>
          <span className="text-xs text-muted-foreground">
            {servizio.orario_servizio}
          </span>
        </div>

        {/* Percorso con Città in Bold */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="truncate text-xs">
              <span className="text-muted-foreground">Da:</span>{' '}
              {servizio.citta_presa && (
                <>
                  <span className="font-bold">{servizio.citta_presa}</span>
                  {servizio.indirizzo_presa && <span> - {servizio.indirizzo_presa}</span>}
                </>
              )}
              {!servizio.citta_presa && servizio.indirizzo_presa && (
                <span>{servizio.indirizzo_presa}</span>
              )}
            </p>
            <p className="truncate text-xs">
              <span className="text-muted-foreground">A:</span>{' '}
              {servizio.citta_destinazione && (
                <>
                  <span className="font-bold">{servizio.citta_destinazione}</span>
                  {servizio.indirizzo_destinazione && <span> - {servizio.indirizzo_destinazione}</span>}
                </>
              )}
              {!servizio.citta_destinazione && servizio.indirizzo_destinazione && (
                <span>{servizio.indirizzo_destinazione}</span>
              )}
            </p>
          </div>
        </div>

        {/* Passeggeri */}
        {servizio.passeggeriCount && servizio.passeggeriCount > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs">
              {servizio.passeggeriCount} {servizio.passeggeriCount === 1 ? 'passeggero' : 'passeggeri'}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer: Pagamento + Importo */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <span className="text-xs uppercase text-muted-foreground">
          {servizio.metodo_pagamento}
        </span>
        {servizio.incasso_previsto && (
          <span className="font-semibold text-primary">
            €{servizio.incasso_previsto.toFixed(2)}
          </span>
        )}
      </div>

      {/* Button Assegna per servizi da_assegnare (solo admin/socio) */}
      {servizio.stato === 'da_assegnare' && isAdminOrSocio && (
        <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="default" 
            size="sm"
            onClick={(e) => handleAssignClick(e, servizio)}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Assegna Servizio
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <MainLayout>
      {/* CRITICAL: Usa ESATTAMENTE lo stesso pattern di ServizioCreaPage */}
      <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Servizi</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestisci tutti i servizi dell'azienda
            </p>
          </div>
          <Button 
            onClick={() => navigate("/servizi/crea")}
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Servizio
          </Button>
        </div>

        {/* Search Bar (opzionale) */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca azienda, commessa..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs Responsive con Sfondo Desktop */}
        <div className="w-full mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Container con sfondo grigio */}
            <div className="
              w-full
              sm:bg-muted/40
              sm:border sm:border-border 
              sm:rounded-lg 
              sm:shadow-sm
              sm:px-6 sm:py-4
              sm:mb-4
            ">
              <div 
                ref={tabsScrollRef}
                className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-3 sm:pb-0 scrollbar-hide"
                style={{
                  scrollSnapType: 'x proximity',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <TabsList className="inline-flex flex-nowrap w-max min-w-full gap-2 sm:gap-4 p-0 bg-transparent justify-start">
                
                {/* Tab: Bozze */}
                <TabsTrigger 
                  value="bozza"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Bozze</span>
                  {statusCounts.bozza > 0 && (
                    <Badge 
                      className={
                        activeTab === 'bozza'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-gray-400 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-gray-400 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.bozza}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Da Assegnare */}
                <TabsTrigger 
                  value="da_assegnare"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Da Assegnare</span>
                  {statusCounts.da_assegnare > 0 && (
                    <Badge 
                      className={
                        activeTab === 'da_assegnare'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-yellow-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-yellow-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.da_assegnare}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Assegnati */}
                <TabsTrigger 
                  value="assegnato"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Assegnati</span>
                  {statusCounts.assegnato > 0 && (
                    <Badge 
                      className={
                        activeTab === 'assegnato'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-blue-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-blue-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.assegnato}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Non Accettati */}
                <TabsTrigger 
                  value="non_accettato"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Non Accettati</span>
                  {statusCounts.non_accettato > 0 && (
                    <Badge 
                      className={
                        activeTab === 'non_accettato'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-orange-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-orange-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.non_accettato}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Completati */}
                <TabsTrigger 
                  value="completato"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Completati</span>
                  {statusCounts.completato > 0 && (
                    <Badge 
                      className={
                        activeTab === 'completato'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-green-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-green-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.completato}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Annullati */}
                <TabsTrigger 
                  value="annullato"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Annullati</span>
                  {statusCounts.annullato > 0 && (
                    <Badge 
                      className={
                        activeTab === 'annullato'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-red-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-red-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.annullato}
                    </Badge>
                  )}
                </TabsTrigger>

                {/* Tab: Consuntivati */}
                <TabsTrigger 
                  value="consuntivato"
                  className="
                    flex-shrink-0 flex items-center gap-2
                    px-4 py-2.5 rounded-full text-sm font-medium
                    data-[state=inactive]:bg-muted/60
                    data-[state=inactive]:text-foreground
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    sm:px-4 sm:py-2.5
                    sm:text-sm
                    sm:font-semibold
                    sm:rounded-full
                    sm:data-[state=inactive]:bg-transparent
                    sm:data-[state=inactive]:text-muted-foreground
                    sm:data-[state=inactive]:hover:text-foreground
                    sm:data-[state=inactive]:hover:bg-muted/50
                    sm:data-[state=active]:bg-primary
                    sm:data-[state=active]:text-primary-foreground
                    sm:data-[state=active]:font-bold
                    sm:data-[state=active]:shadow-md
                    sm:data-[state=active]:scale-[1.02]
                    transition-all duration-200 ease-in-out
                  "
                >
                  <span className="whitespace-nowrap">Consuntivati</span>
                  {statusCounts.consuntivato > 0 && (
                    <Badge 
                      className={
                        activeTab === 'consuntivato'
                          ? "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-white text-primary sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:bg-purple-500 sm:text-white sm:shadow-sm"
                          : "flex-shrink-0 h-5 min-w-[24px] px-2 text-xs font-bold rounded-full bg-purple-500 text-white sm:h-6 sm:min-w-[28px] sm:px-2.5 sm:text-sm sm:shadow-sm"
                      }
                    >
                      {statusCounts.consuntivato}
                    </Badge>
                  )}
                </TabsTrigger>

              </TabsList>
              </div>
            </div>

            {/* Tab Content - All tabs show the same content */}
            <TabsContent value={activeTab} className="mt-6">
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

        {/* Error State */}
        {error && (
          <Card className="w-full p-8 text-center">
            <p className="text-destructive">Errore nel caricamento dei servizi</p>
          </Card>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* MOBILE: Card List */}
            {isMobile ? (
              <div className="w-full space-y-3">
                {filteredServizi.map(renderMobileCard)}
                {filteredServizi.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground mb-4">Nessun servizio trovato</p>
                    <Button 
                      onClick={() => navigate("/servizi/crea")}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crea il primo servizio
                    </Button>
                  </Card>
                )}
              </div>
            ) : (
              /* DESKTOP: Table */
              <TooltipProvider>
                <Card className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead className="w-[180px]">Azienda</TableHead>
                        <TableHead className="min-w-[350px]">Percorso</TableHead>
                        <TableHead className="w-[140px]">Data e Orario</TableHead>
                        <TableHead className="w-[130px]">Stato</TableHead>
                        <TableHead className="w-[100px]">Passeggeri</TableHead>
                        <TableHead className="w-[80px] text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServizi.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nessun servizio trovato
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServizi.map((servizio: ServizioWithPasseggeri) => (
                          <TableRow 
                            key={servizio.id}
                            className="hover:bg-muted/50"
                          >
                            {/* ID */}
                            <TableCell 
                              className="font-mono text-xs cursor-pointer w-[80px]"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              <div className="truncate" title={servizio.id}>
                                #{servizio.id.slice(0, 8)}
                              </div>
                            </TableCell>

                            {/* Azienda */}
                            <TableCell 
                              className="cursor-pointer w-[180px]"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              <div className="space-y-0.5">
                                <div className="font-medium truncate" title={servizio.aziende?.nome || 'N/A'}>
                                  {servizio.aziende?.nome || 'N/A'}
                                </div>
                                {servizio.numero_commessa && (
                                  <div className="text-xs text-muted-foreground truncate" title={servizio.numero_commessa}>
                                    {servizio.numero_commessa}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Percorso con Città */}
                            <TableCell 
                              className="min-w-[350px] cursor-pointer"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground flex-shrink-0">Da:</span>
                                  <div className="flex-1 min-w-0 truncate">
                                    {servizio.citta_presa && (
                                      <>
                                        <span className="font-bold">{servizio.citta_presa}</span>
                                        {servizio.indirizzo_presa && <span> - {servizio.indirizzo_presa}</span>}
                                      </>
                                    )}
                                    {!servizio.citta_presa && servizio.indirizzo_presa && (
                                      <span>{servizio.indirizzo_presa}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground flex-shrink-0">A:</span>
                                  <div className="flex-1 min-w-0 truncate">
                                    {servizio.citta_destinazione && (
                                      <>
                                        <span className="font-bold">{servizio.citta_destinazione}</span>
                                        {servizio.indirizzo_destinazione && <span> - {servizio.indirizzo_destinazione}</span>}
                                      </>
                                    )}
                                    {!servizio.citta_destinazione && servizio.indirizzo_destinazione && (
                                      <span>{servizio.indirizzo_destinazione}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Data e Orario */}
                            <TableCell 
                              className="cursor-pointer w-[140px]"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              <div className="whitespace-nowrap font-medium">
                                {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {servizio.orario_servizio}
                              </div>
                            </TableCell>
                            
                            {/* Stato */}
                            <TableCell 
                              className="cursor-pointer w-[130px]"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              <Badge className={getStatusColor(servizio.stato)}>
                                {getStatusLabel(servizio.stato)}
                              </Badge>
                            </TableCell>

                            {/* Passeggeri con Tooltip */}
                            <TableCell 
                              className="cursor-pointer w-[100px]"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              {servizio.passeggeriCount && servizio.passeggeriCount > 0 ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 cursor-help justify-center">
                                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="font-medium text-sm">{servizio.passeggeriCount}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-xs">Passeggeri:</p>
                                      {servizio.passeggeri?.map((p, idx) => (
                                        <p key={p.id} className="text-xs">
                                          {idx + 1}. {p.nome_cognome}
                                        </p>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>

                            {/* Azioni con icone e tooltip */}
                            <TableCell className="text-right min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                
                                {/* Assegna - Solo se da_assegnare e admin/socio */}
                                {servizio.stato === 'da_assegnare' && isAdminOrSocio && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAssignClick(e, servizio);
                                        }}
                                      >
                                        <UserPlus className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Assegna Servizio</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* Visualizza Dettagli - Sempre visibile */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/servizi/${servizio.id}`);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visualizza Dettagli</p>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Completa - Solo se assegnato */}
                                {servizio.stato === 'assegnato' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/servizi/${servizio.id}`);
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Completa Servizio</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* Consuntiva - Solo se completato */}
                                {servizio.stato === 'completato' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/servizi/${servizio.id}`);
                                        }}
                                      >
                                        <FileText className="h-4 w-4 text-blue-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Consuntiva Servizio</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* Annulla - Se da_assegnare o assegnato */}
                                {(servizio.stato === 'da_assegnare' || servizio.stato === 'assegnato') && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/servizi/${servizio.id}`);
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Annulla Servizio</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TooltipProvider>
            )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>

      {/* Assignment Popup */}
      {selectedServizio && (
        <AssignmentPopup
          open={showAssignmentPopup}
          onOpenChange={setShowAssignmentPopup}
          onClose={() => {
            setShowAssignmentPopup(false);
            setSelectedServizio(null);
            refetch();
          }}
          servizio={selectedServizio}
        />
      )}
    </MainLayout>
  );
}
