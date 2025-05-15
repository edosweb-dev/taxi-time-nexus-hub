
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GetMovimentiOptions } from "@/lib/types/spese";
import { format } from "date-fns";
import { UserFilterDropdown } from "@/components/shifts/filters";
import {
  DateRangeFilter,
  CausaleFilter,
  ImportoFilter,
  TipoFilter,
  StatoFilter,
  FilterActions
} from "./filters";

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
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />

          <CausaleFilter 
            value={causale} 
            onChange={setCausale} 
          />

          {showUserFilter && (
            <div className="space-y-2">
              <UserFilterDropdown
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            </div>
          )}

          <ImportoFilter
            minImporto={minImporto}
            maxImporto={maxImporto}
            onMinChange={setMinImporto}
            onMaxChange={setMaxImporto}
          />

          {showTipoFilter && (
            <TipoFilter 
              value={tipo} 
              onChange={setTipo} 
            />
          )}

          {showStatoFilter && (
            <StatoFilter 
              value={stato} 
              onChange={setStato} 
            />
          )}
        </div>

        <FilterActions 
          onReset={resetFilters} 
          onApply={applyFilters} 
        />
      </CardContent>
    </Card>
  );
}
