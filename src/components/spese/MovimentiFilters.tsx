
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GetMovimentiOptions } from "@/lib/types/spese";
import { UserFilterDropdown } from "@/components/shifts/filters";

interface MovimentiFiltersProps {
  onFiltersChange: (filters: GetMovimentiOptions) => void;
  showUserFilter?: boolean;
  showTipoFilter?: boolean;
  showStatoFilter?: boolean;
}

export function MovimentiFilters({
  onFiltersChange,
  showUserFilter = false,
  showTipoFilter = false,
  showStatoFilter = false,
}: MovimentiFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [causale, setCausale] = useState<string>("");
  const [minImporto, setMinImporto] = useState<number | undefined>(undefined);
  const [maxImporto, setMaxImporto] = useState<number | undefined>(undefined);
  const [tipo, setTipo] = useState<string>("");
  const [stato, setStato] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const applyFilters = () => {
    const filters: GetMovimentiOptions = {};

    if (dateFrom) filters.dateFrom = format(dateFrom, "yyyy-MM-dd");
    if (dateTo) filters.dateTo = format(dateTo, "yyyy-MM-dd");
    if (causale) filters.causale = causale;
    if (minImporto !== undefined) filters.minImporto = minImporto;
    if (maxImporto !== undefined) filters.maxImporto = maxImporto;
    if (tipo) filters.tipo = tipo as any;
    if (stato) filters.stato = stato as any;
    if (selectedUserId) filters.userId = selectedUserId;

    onFiltersChange(filters);
  };

  const resetFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setCausale("");
    setMinImporto(undefined);
    setMaxImporto(undefined);
    setTipo("");
    setStato("");
    setSelectedUserId(null);

    onFiltersChange({});
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-from">Data da</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to">Data a</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="causale">Causale</Label>
            <Input
              id="causale"
              placeholder="Cerca per causale"
              value={causale}
              onChange={(e) => setCausale(e.target.value)}
            />
          </div>

          {showUserFilter && (
            <div className="space-y-2">
              <Label htmlFor="user-filter">Utente</Label>
              <UserFilterDropdown
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="min-importo">Importo min (€)</Label>
            <Input
              id="min-importo"
              type="number"
              placeholder="0.00"
              value={minImporto === undefined ? "" : minImporto}
              onChange={(e) => setMinImporto(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-importo">Importo max (€)</Label>
            <Input
              id="max-importo"
              type="number"
              placeholder="0.00"
              value={maxImporto === undefined ? "" : maxImporto}
              onChange={(e) => setMaxImporto(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {showTipoFilter && (
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti i tipi</SelectItem>
                  <SelectItem value="spesa">Spesa</SelectItem>
                  <SelectItem value="incasso">Incasso</SelectItem>
                  <SelectItem value="prelievo">Prelievo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatoFilter && (
            <div className="space-y-2">
              <Label htmlFor="stato">Stato</Label>
              <Select value={stato} onValueChange={setStato}>
                <SelectTrigger id="stato">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti gli stati</SelectItem>
                  <SelectItem value="saldato">Saldato</SelectItem>
                  <SelectItem value="pending">Da saldare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="outline" onClick={resetFilters}>
            Resetta
          </Button>
          <Button onClick={applyFilters}>
            <FilterIcon className="mr-2 h-4 w-4" />
            Applica Filtri
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
