import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Plus,
  Download,
  FileText,
  Calendar,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
} from "lucide-react";
import { useReportCliente } from "@/hooks/useReportCliente";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Types for enriched service data
interface ServizioDettaglio {
  id: string;
  id_progressivo: string | null;
  data_servizio: string;
  orario_servizio: string;
  stato: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  citta_presa: string | null;
  citta_destinazione: string | null;
  numero_commessa: string | null;
  ore_fatturate: number | null;
  incasso_previsto: number | null;
  incasso_ricevuto: number | null;
  assegnato_nome: string | null;
  veicolo_info: string | null;
  passeggeri_nomi: string[];
}

const ReportCliente = () => {
  const navigate = useNavigate();
  const { reports, isLoading, profile, isLoadingProfile, generateReport, downloadReport } = useReportCliente();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnno, setSelectedAnno] = useState<number>(new Date().getFullYear());
  const [selectedMese, setSelectedMese] = useState<number>(new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filtri tabella (client-side)
  const [filtroAnno, setFiltroAnno] = useState<string>("");
  const [filtroMese, setFiltroMese] = useState<string>("");
  const [filtroStato, setFiltroStato] = useState<string>("");

  // Helper: converti mese numero → nome
  const getMeseNome = (mese: number): string => {
    const mesi = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    return mesi[mese - 1] || mese.toString();
  };

  // Helper: badge variant per stato report
  const getStatoBadgeVariant = (stato: string) => {
    switch (stato) {
      case "completato":
        return "default";
      case "in_generazione":
        return "secondary";
      case "errore":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Helper: badge for servizio stato
  const getServizioStatoBadge = (stato: string) => {
    switch (stato) {
      case "da_assegnare":
        return <Badge variant="secondary" className="text-xs">Da assegnare</Badge>;
      case "assegnato":
        return <Badge className="text-xs bg-blue-500 hover:bg-blue-600 text-white border-transparent">Assegnato</Badge>;
      case "completato":
        return <Badge variant="success" className="text-xs">Completato</Badge>;
      case "consuntivato":
        return <Badge className="text-xs bg-purple-500 hover:bg-purple-600 text-white border-transparent">Consuntivato</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{stato}</Badge>;
    }
  };

  // Query servizi for expanded report
  const { data: serviziDettaglio, isLoading: isLoadingServizi } = useQuery({
    queryKey: ["report-servizi-dettaglio", expandedReportId],
    queryFn: async (): Promise<ServizioDettaglio[]> => {
      if (!expandedReportId) return [];
      
      // Find the report to get date range and azienda_id
      const report = reports?.find(r => r.id === expandedReportId);
      if (!report) return [];

      // Fetch servizi for this period/azienda
      const { data: servizi, error } = await supabase
        .from("servizi")
        .select("id, id_progressivo, data_servizio, orario_servizio, stato, indirizzo_presa, indirizzo_destinazione, citta_presa, citta_destinazione, numero_commessa, ore_fatturate, incasso_previsto, incasso_ricevuto, assegnato_a, veicolo_id")
        .eq("azienda_id", report.azienda_id)
        .in("stato", ["da_assegnare", "assegnato", "completato", "consuntivato"])
        .gte("data_servizio", report.data_inizio)
        .lte("data_servizio", report.data_fine)
        .order("data_servizio", { ascending: true });

      if (error) throw error;
      if (!servizi || servizi.length === 0) return [];

      // Batch lookup profiles, veicoli, passeggeri
      const assigneeIds = [...new Set(servizi.map(s => s.assegnato_a).filter(Boolean))] as string[];
      const veicoloIds = [...new Set(servizi.map(s => s.veicolo_id).filter(Boolean))] as string[];
      const servizioIds = servizi.map(s => s.id);

      const [profilesRes, veicoliRes, passeggeriRes] = await Promise.all([
        assigneeIds.length > 0
          ? supabase.from("profiles").select("id, first_name, last_name").in("id", assigneeIds)
          : { data: [] },
        veicoloIds.length > 0
          ? supabase.from("veicoli").select("id, modello, targa").in("id", veicoloIds)
          : { data: [] },
        supabase.from("servizi_passeggeri")
          .select("servizio_id, passeggero_id, nome_cognome_inline, passeggeri:passeggero_id(nome_cognome)")
          .in("servizio_id", servizioIds),
      ]);

      const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
      const veicoliMap = new Map((veicoliRes.data || []).map(v => [v.id, `${v.modello} ${v.targa}`.trim()]));
      
      // Group passeggeri by servizio_id
      const passeggeriMap = new Map<string, string[]>();
      (passeggeriRes.data || []).forEach((sp: any) => {
        const nome = sp.passeggeri?.nome_cognome || sp.nome_cognome_inline || '';
        if (nome) {
          if (!passeggeriMap.has(sp.servizio_id)) {
            passeggeriMap.set(sp.servizio_id, []);
          }
          passeggeriMap.get(sp.servizio_id)!.push(nome);
        }
      });

      return servizi.map(s => ({
        id: s.id,
        id_progressivo: s.id_progressivo,
        data_servizio: s.data_servizio,
        orario_servizio: s.orario_servizio,
        stato: s.stato,
        indirizzo_presa: s.indirizzo_presa,
        indirizzo_destinazione: s.indirizzo_destinazione,
        citta_presa: s.citta_presa,
        citta_destinazione: s.citta_destinazione,
        numero_commessa: s.numero_commessa,
        ore_fatturate: s.ore_fatturate,
        incasso_previsto: s.incasso_previsto,
        incasso_ricevuto: s.incasso_ricevuto,
        assegnato_nome: s.assegnato_a ? (profilesMap.get(s.assegnato_a) || null) : null,
        veicolo_info: s.veicolo_id ? (veicoliMap.get(s.veicolo_id) || null) : null,
        passeggeri_nomi: passeggeriMap.get(s.id) || [],
      }));
    },
    enabled: !!expandedReportId && !!reports?.length,
  });

  // Genera report: Anno+Mese → data_inizio/data_fine
  const handleGenerate = async () => {
    if (!profile?.azienda_id) {
      toast({
        title: "❌ Errore",
        description: "Profilo non caricato correttamente",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const dataInizio = `${selectedAnno}-${String(selectedMese).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedAnno, selectedMese, 0).getDate();
      const dataFine = `${selectedAnno}-${String(selectedMese).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      generateReport({
        azienda_id: profile.azienda_id,
        data_inizio: dataInizio,
        data_fine: dataFine,
      });

      toast({
        title: "✅ Report in generazione",
        description: "Il report verrà generato a breve. Aggiorna la pagina tra qualche minuto.",
      });

      setDialogOpen(false);
    } catch (error: any) {
      console.error("[ReportCliente] Generate error:", error);
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile generare il report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReportId(prev => prev === reportId ? null : reportId);
  };

  // Filtri client-side
  const reportsFiltrati = (reports || []).filter((report) => {
    if (filtroAnno) {
      const [annoStr] = report.data_inizio.split('-');
      if (parseInt(annoStr) !== parseInt(filtroAnno)) return false;
    }
    if (filtroMese) {
      const [, meseStr] = report.data_inizio.split('-');
      if (parseInt(meseStr) !== parseInt(filtroMese)) return false;
    }
    if (filtroStato && report.stato !== filtroStato) return false;
    return true;
  });

  // Anni disponibili per select
  const anniDisponibili = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Format importo
  const formatImporto = (servizio: ServizioDettaglio) => {
    const importo = servizio.incasso_ricevuto ?? servizio.incasso_previsto;
    if (importo == null) return "-";
    const label = servizio.incasso_ricevuto != null ? "" : " (prev.)";
    return `€${importo.toFixed(2)}${label}`;
  };

  // Dettaglio servizi table component
  const renderDettaglioServizi = (reportId: string) => {
    if (expandedReportId !== reportId) return null;

    if (isLoadingServizi) {
      return (
        <Card className="mt-4 border-dashed">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Caricamento servizi...</span>
          </CardContent>
        </Card>
      );
    }

    if (!serviziDettaglio || serviziDettaglio.length === 0) {
      return (
        <Card className="mt-4 border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessun servizio trovato per questo periodo
          </CardContent>
        </Card>
      );
    }

    const report = reports?.find(r => r.id === reportId);
    const totaleImporti = serviziDettaglio.reduce((sum, s) => {
      return sum + (s.incasso_ricevuto ?? s.incasso_previsto ?? 0);
    }, 0);

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-lg">
              Dettaglio Servizi ({serviziDettaglio.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                Totale: €{totaleImporti.toFixed(2)}
              </span>
              {report?.stato === "completato" && report?.url_file && (
                <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">ID</TableHead>
                  <TableHead className="min-w-[110px]">Data e Orario</TableHead>
                  <TableHead className="min-w-[110px]">Stato</TableHead>
                  <TableHead className="min-w-[80px]">Passeggeri</TableHead>
                  <TableHead className="min-w-[200px]">Percorso</TableHead>
                  <TableHead className="min-w-[100px]">Commessa</TableHead>
                  <TableHead className="min-w-[60px] text-right">Ore</TableHead>
                  <TableHead className="min-w-[100px] text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviziDettaglio.map((servizio) => (
                  <TableRow key={servizio.id}>
                    <TableCell className="font-mono text-xs">
                      {servizio.id_progressivo || servizio.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {new Date(servizio.data_servizio).toLocaleDateString("it-IT")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {servizio.orario_servizio}
                      </div>
                    </TableCell>
                    <TableCell>{getServizioStatoBadge(servizio.stato)}</TableCell>
                    <TableCell>
                      {servizio.passeggeri_nomi.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-default">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{servizio.passeggeri_nomi.length}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm space-y-1">
                                {servizio.passeggeri_nomi.map((nome, i) => (
                                  <div key={i}>{nome}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Da: </span>
                          <span className="font-semibold">{servizio.citta_presa}</span>
                          {servizio.indirizzo_presa && (
                            <span className="text-muted-foreground"> - {servizio.indirizzo_presa}</span>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">A: </span>
                          <span className="font-semibold">{servizio.citta_destinazione}</span>
                          {servizio.indirizzo_destinazione && (
                            <span className="text-muted-foreground"> - {servizio.indirizzo_destinazione}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {servizio.numero_commessa || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      {servizio.ore_fatturate != null ? servizio.ore_fatturate : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium">
                      {formatImporto(servizio)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading || isLoadingProfile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard-cliente")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Report PDF Mensili</h1>
              <p className="text-muted-foreground">
                Genera e scarica i report dei tuoi servizi
              </p>
            </div>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            disabled={!profile}
          >
            <Plus className="h-4 w-4 mr-2" />
            Genera Nuovo Report
          </Button>
        </div>

        {/* Filtri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Anno</Label>
                <Select value={filtroAnno || 'all'} onValueChange={(v) => setFiltroAnno(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli anni" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    {anniDisponibili.map((anno) => (
                      <SelectItem key={anno} value={anno.toString()}>
                        {anno}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mese</Label>
                <Select value={filtroMese || 'all'} onValueChange={(v) => setFiltroMese(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i mesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mese) => (
                      <SelectItem key={mese} value={mese.toString()}>
                        {getMeseNome(mese)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stato</Label>
                <Select value={filtroStato || 'all'} onValueChange={(v) => setFiltroStato(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli stati" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="in_generazione">In Generazione</SelectItem>
                    <SelectItem value="errore">Errore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportsFiltrati.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                {reportsFiltrati.length} report trovati
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lista Report - Empty State */}
        {reportsFiltrati.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nessun report trovato
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Non hai ancora generato nessun report PDF.
              </p>
              <Button onClick={() => setDialogOpen(true)} disabled={!profile}>
                <Plus className="h-4 w-4 mr-2" />
                Genera Primo Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reportsFiltrati.map((report) => {
              const [annoStr, meseStr] = report.data_inizio.split('-');
              const anno = parseInt(annoStr);
              const mese = parseInt(meseStr);
              const periodo = `${getMeseNome(mese)} ${anno}`;
              const isExpanded = expandedReportId === report.id;

              return (
                <div key={report.id}>
                  <Card
                    className={`cursor-pointer transition-colors hover:bg-muted/30 ${isExpanded ? 'border-primary/50' : ''}`}
                    onClick={() => report.stato === "completato" && toggleExpand(report.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{periodo}</span>
                          <Badge variant={getStatoBadgeVariant(report.stato)}>
                            {report.stato === "in_generazione" && (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {report.stato.replace("_", " ")}
                          </Badge>
                          {report.numero_servizi != null && report.numero_servizi > 0 && (
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                              {report.numero_servizi} servizi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {new Date(report.created_at).toLocaleDateString("it-IT")}
                          </span>
                          {report.stato === "completato" && report.url_file && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); downloadReport(report); }}
                            >
                              <Download className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">PDF</span>
                            </Button>
                          )}
                          {report.stato === "completato" && (
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleExpand(report.id); }}>
                              {isExpanded
                                ? <ChevronUp className="h-4 w-4" />
                                : <Eye className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dettaglio servizi expandable */}
                  {renderDettaglioServizi(report.id)}
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog Genera Report */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Genera Nuovo Report PDF</DialogTitle>
              <DialogDescription>
                Seleziona il mese e l'anno per generare il report mensile dei servizi
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Azienda READ-ONLY */}
              <div className="space-y-2">
                <Label>Azienda</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                  <span className="font-medium">
                    {profile?.aziende?.nome || "Caricamento..."}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    La tua azienda
                  </Badge>
                </div>
              </div>

              {/* Referente READ-ONLY */}
              <div className="space-y-2">
                <Label>Referente</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                  <span className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Tu
                  </Badge>
                </div>
              </div>

              {/* Anno */}
              <div className="space-y-2">
                <Label htmlFor="anno">
                  Anno <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedAnno.toString()}
                  onValueChange={(value) => setSelectedAnno(parseInt(value))}
                >
                  <SelectTrigger id="anno">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anniDisponibili.map((anno) => (
                      <SelectItem key={anno} value={anno.toString()}>
                        {anno}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mese */}
              <div className="space-y-2">
                <Label htmlFor="mese">
                  Mese <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedMese.toString()}
                  onValueChange={(value) => setSelectedMese(parseInt(value))}
                >
                  <SelectTrigger id="mese">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mese) => (
                      <SelectItem key={mese} value={mese.toString()}>
                        {getMeseNome(mese)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !profile}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Genera Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ReportCliente;
