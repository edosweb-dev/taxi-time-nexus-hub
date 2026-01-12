import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useServiziWithPasseggeri } from "@/hooks/useServiziWithPasseggeri";
import { useAziende } from "@/hooks/useAziende.tsx";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layouts/MainLayout";

const STATO_LABELS: Record<string, { label: string; color: string }> = {
  bozza: { label: "Bozza", color: "bg-muted text-muted-foreground" },
  da_assegnare: { label: "Da Assegnare", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  assegnato: { label: "Assegnato", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  completato: { label: "Completato", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  consuntivato: { label: "Consuntivato", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  annullato: { label: "Annullato", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  non_accettato: { label: "Non Accettato", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  richiesta_cliente: { label: "Richiesta", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
};

export default function RicercaServiziPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filtroStato, setFiltroStato] = useState("tutti");
  const [filtroAzienda, setFiltroAzienda] = useState("tutti");
  const [showFilters, setShowFilters] = useState(false);

  const { data: servizi = [], isLoading } = useServiziWithPasseggeri();
  const { aziende = [] } = useAziende();

  // Filtra servizi
  const filteredServizi = useMemo(() => {
    let result = [...servizi];

    // Filtro per stato
    if (filtroStato && filtroStato !== "tutti") {
      result = result.filter(s => s.stato === filtroStato);
    }

    // Filtro per azienda
    if (filtroAzienda && filtroAzienda !== "tutti") {
      result = result.filter(s => s.azienda_id === filtroAzienda);
    }

    // Filtro per ricerca testuale
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(servizio => {
        const azienda = aziende.find(a => a.id === servizio.azienda_id);
        const aziendaNome = azienda?.nome?.toLowerCase() || "";
        const clientePrivatoFull = `${servizio.cliente_privato_nome || ""} ${servizio.cliente_privato_cognome || ""}`.toLowerCase().trim();
        const passeggeriNomi = servizio.passeggeri?.map(
          (p) => p.nome_cognome?.toLowerCase() || ""
        ).join(" ") || "";

        return (
          servizio.numero_commessa?.toLowerCase().includes(searchLower) ||
          servizio.id_progressivo?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_presa?.toLowerCase().includes(searchLower) ||
          servizio.indirizzo_destinazione?.toLowerCase().includes(searchLower) ||
          servizio.citta_presa?.toLowerCase().includes(searchLower) ||
          servizio.citta_destinazione?.toLowerCase().includes(searchLower) ||
          aziendaNome.includes(searchLower) ||
          clientePrivatoFull.includes(searchLower) ||
          passeggeriNomi.includes(searchLower)
        );
      });
    }

    // Ordina per data DESC
    result.sort((a, b) => new Date(b.data_servizio).getTime() - new Date(a.data_servizio).getTime());

    return result;
  }, [servizi, aziende, searchText, filtroStato, filtroAzienda]);

  const clearFilters = () => {
    setSearchText("");
    setFiltroStato("tutti");
    setFiltroAzienda("tutti");
  };

  const hasActiveFilters = searchText || filtroStato !== "tutti" || filtroAzienda !== "tutti";

  const getClienteName = (servizio: any) => {
    if (servizio.tipo_cliente === "privato") {
      return `${servizio.cliente_privato_nome || ""} ${servizio.cliente_privato_cognome || ""}`.trim() || "Cliente Privato";
    }
    const azienda = aziende.find(a => a.id === servizio.azienda_id);
    return azienda?.nome || "N/A";
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ricerca Servizi
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Cerca in tutti i servizi per cliente, passeggero, indirizzo o commessa
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/servizi")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Servizi
          </Button>
        </div>

        {/* Barra Ricerca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Cerca per cliente, passeggero, indirizzo, commessa..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-12 text-base md:text-lg"
            />
            {searchText && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchText("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtri
            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        </div>

        {/* Filtri Opzionali */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="w-full sm:w-48">
                    <label className="text-sm font-medium mb-1 block">Stato</label>
                    <Select value={filtroStato} onValueChange={setFiltroStato}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona stato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutti">Tutti gli stati</SelectItem>
                        {Object.entries(STATO_LABELS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-64">
                    <label className="text-sm font-medium mb-1 block">Azienda</label>
                    <Select value={filtroAzienda} onValueChange={setFiltroAzienda}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona azienda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutti">Tutte le aziende</SelectItem>
                        {aziende.map((az) => (
                          <SelectItem key={az.id} value={az.id}>{az.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Pulisci filtri
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Conteggio Risultati */}
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters ? (
            <span className="font-medium">{filteredServizi.length} risultati trovati</span>
          ) : (
            <span>{filteredServizi.length} servizi totali</span>
          )}
        </div>

        {/* Lista Risultati */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredServizi.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {searchText ? `Nessun risultato per "${searchText}"` : "Nessun servizio trovato"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredServizi.map((servizio) => {
              const statoInfo = STATO_LABELS[servizio.stato] || { label: servizio.stato, color: "bg-muted" };
              const passeggeri = servizio.passeggeri || [];

              return (
                <Card
                  key={servizio.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{
                    borderLeftColor: servizio.stato === 'completato' ? 'hsl(var(--chart-2))' :
                      servizio.stato === 'assegnato' ? 'hsl(var(--chart-1))' :
                      servizio.stato === 'da_assegnare' ? 'hsl(var(--chart-4))' :
                      servizio.stato === 'consuntivato' ? 'hsl(var(--chart-5))' :
                      'hsl(var(--border))'
                  }}
                  onClick={() => navigate(`/servizi/${servizio.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-2">
                      {/* Prima riga: commessa, data, badge stato */}
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">
                            {servizio.numero_commessa || servizio.id_progressivo || "—"}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {format(new Date(servizio.data_servizio), "dd MMM yyyy", { locale: it })}
                            {" • "}
                            {servizio.orario_servizio?.slice(0, 5) || "N/A"}
                          </span>
                        </div>
                        <Badge className={`${statoInfo.color} whitespace-nowrap`}>
                          {statoInfo.label}
                        </Badge>
                      </div>

                      {/* Seconda riga: cliente */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{getClienteName(servizio)}</span>
                        {servizio.tipo_cliente === "privato" && (
                          <Badge variant="outline" className="text-xs">Privato</Badge>
                        )}
                      </div>

                      {/* Terza riga: percorso */}
                      <div className="text-sm text-muted-foreground truncate">
                        {servizio.citta_presa || servizio.indirizzo_presa} → {servizio.citta_destinazione || servizio.indirizzo_destinazione}
                      </div>

                      {/* Quarta riga: passeggeri */}
                      {passeggeri.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Passeggeri: </span>
                          <span className="text-foreground">
                            {passeggeri.map((p) => p.nome_cognome).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
