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
  ArrowLeft,
  Plus,
  Download,
  FileText,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { useReportCliente } from "@/hooks/useReportCliente";
import { useToast } from "@/hooks/use-toast";

const ReportCliente = () => {
  const navigate = useNavigate();
  const { reports, isLoading, profile, isLoadingProfile, generateReport, downloadReport } = useReportCliente();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnno, setSelectedAnno] = useState<number>(new Date().getFullYear());
  const [selectedMese, setSelectedMese] = useState<number>(new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Helper: badge variant per stato
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
      // Costruisci data_inizio (primo giorno del mese)
      const dataInizio = new Date(selectedAnno, selectedMese - 1, 1)
        .toISOString()
        .split("T")[0];

      // Costruisci data_fine (ultimo giorno del mese)
      const dataFine = new Date(selectedAnno, selectedMese, 0)
        .toISOString()
        .split("T")[0];

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

  // Filtri client-side
  const reportsFiltrati = (reports || []).filter((report) => {
    if (filtroAnno) {
      const anno = new Date(report.data_inizio).getFullYear();
      if (anno !== parseInt(filtroAnno)) return false;
    }
    if (filtroMese) {
      const mese = new Date(report.data_inizio).getMonth() + 1;
      if (mese !== parseInt(filtroMese)) return false;
    }
    if (filtroStato && report.stato !== filtroStato) return false;
    return true;
  });

  // Anni disponibili per select
  const anniDisponibili = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

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
          <>
            {/* Tabella Desktop */}
            <Card className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data Creazione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsFiltrati.map((report) => {
                    const dataInizio = new Date(report.data_inizio);
                    const anno = dataInizio.getFullYear();
                    const mese = dataInizio.getMonth() + 1;
                    const periodo = `${getMeseNome(mese)} ${anno}`;

                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{periodo}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={getStatoBadgeVariant(report.stato)}>
                            {report.stato === "in_generazione" && (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {report.stato.replace("_", " ")}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString("it-IT")}
                        </TableCell>

                        <TableCell className="text-right">
                          {report.stato === "completato" && report.url_file ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReport(report)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Scarica PDF
                            </Button>
                          ) : report.stato === "in_generazione" ? (
                            <span className="text-sm text-muted-foreground">
                              Elaborazione...
                            </span>
                          ) : (
                            <span className="text-sm text-destructive">
                              Errore generazione
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            {/* Cards Mobile */}
            <div className="md:hidden space-y-4">
              {reportsFiltrati.map((report) => {
                const dataInizio = new Date(report.data_inizio);
                const anno = dataInizio.getFullYear();
                const mese = dataInizio.getMonth() + 1;
                const periodo = `${getMeseNome(mese)} ${anno}`;

                return (
                  <Card key={report.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">{periodo}</CardTitle>
                        </div>
                        <Badge variant={getStatoBadgeVariant(report.stato)}>
                          {report.stato === "in_generazione" && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {report.stato.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="text-sm text-muted-foreground">
                        Creato il {new Date(report.created_at).toLocaleDateString("it-IT")}
                      </div>

                      {report.stato === "completato" && report.url_file && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Scarica PDF
                        </Button>
                      )}

                      {report.stato === "in_generazione" && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Elaborazione in corso...
                        </div>
                      )}

                      {report.stato === "errore" && (
                        <div className="text-sm text-destructive text-center py-2">
                          Errore durante la generazione
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
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
