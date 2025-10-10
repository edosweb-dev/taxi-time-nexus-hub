import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServiziWithPasseggeri, ServizioWithPasseggeri } from "@/hooks/useServiziWithPasseggeri";
import { useAziende } from "@/hooks/useAziende";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Calendar, MapPin, Loader2, Search, Filter, Users, MoreVertical, CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Servizio } from "@/lib/types/servizi";

export default function ServiziPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: servizi = [], isLoading, error } = useServiziWithPasseggeri();
  const { aziende = [] } = useAziende();
  const { users = [] } = useUsers();
  
  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate status counts
  const statusCounts = useMemo(() => ({
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
      da_assegnare: 'bg-yellow-500 text-white',
      assegnato: 'bg-blue-500 text-white',
      completato: 'bg-green-500 text-white',
      consuntivato: 'bg-purple-500 text-white',
      annullato: 'bg-red-500 text-white'
    };
    return colors[stato] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (stato: string) => {
    const labels: Record<string, string> = {
      da_assegnare: 'Da Assegnare',
      assegnato: 'Assegnato',
      completato: 'Completato',
      consuntivato: 'Consuntivato',
      annullato: 'Annullato'
    };
    return labels[stato] || stato;
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
            {servizio.aziende?.nome || 'N/A'}
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

        {/* Tabs con Badge Contatori */}
        <div className="mb-6 -mx-3 sm:mx-0" data-component="servizi-tabs">
          <div className="overflow-x-auto px-3 sm:px-0">
            <TabsList className="inline-flex min-w-full sm:w-auto h-auto p-1 bg-muted/30">
              <TabsTrigger 
                value="da_assegnare" 
                onClick={() => setActiveTab('da_assegnare')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Da Assegnare</span>
                {statusCounts.da_assegnare > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-red-500 text-white hover:bg-red-600"
                  >
                    {statusCounts.da_assegnare}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="assegnato"
                onClick={() => setActiveTab('assegnato')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Assegnati</span>
                {statusCounts.assegnato > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    {statusCounts.assegnato}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="non_accettato"
                onClick={() => setActiveTab('non_accettato')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Non Accettati</span>
                {statusCounts.non_accettato > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gray-500 text-white hover:bg-gray-600">
                    {statusCounts.non_accettato}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="completato"
                onClick={() => setActiveTab('completato')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Completati</span>
                {statusCounts.completato > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-green-500 text-white hover:bg-green-600"
                  >
                    {statusCounts.completato}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="annullato"
                onClick={() => setActiveTab('annullato')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Annullati</span>
                {statusCounts.annullato > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gray-500 text-white hover:bg-gray-600">
                    {statusCounts.annullato}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="consuntivato"
                onClick={() => setActiveTab('consuntivato')}
                className="relative px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground whitespace-nowrap"
              >
                <span>Consuntivati</span>
                {statusCounts.consuntivato > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-purple-500 text-white hover:bg-purple-600">
                    {statusCounts.consuntivato}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

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

                            {/* Azioni in base allo stato */}
                            <TableCell className="text-right w-[80px]" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => navigate(`/servizi/${servizio.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizza Dettagli
                                  </DropdownMenuItem>
                                  
                                  {servizio.stato === 'da_assegnare' && (
                                    <DropdownMenuItem onClick={() => navigate(`/servizi/${servizio.id}`)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Assegna Servizio
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {servizio.stato === 'assegnato' && (
                                    <DropdownMenuItem onClick={() => navigate(`/servizi/${servizio.id}`)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Completa Servizio
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {servizio.stato === 'completato' && (
                                    <DropdownMenuItem onClick={() => navigate(`/servizi/${servizio.id}`)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Consuntiva Servizio
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(servizio.stato === 'da_assegnare' || servizio.stato === 'assegnato') && (
                                    <DropdownMenuItem 
                                      onClick={() => navigate(`/servizi/${servizio.id}`)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Annulla Servizio
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      </div>
    </MainLayout>
  );
}
