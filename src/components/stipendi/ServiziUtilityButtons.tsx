
import { Button } from "@/components/ui/button";
import { useServiziUtente } from "@/hooks/useServiziUtente";
import { ArrowDownWideNarrow, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface ServiziUtilityButtonsProps {
  userId?: string;
  mese: number;
  anno: number;
  onKmCalculated: (km: number) => void;
  onOreCalculated: (ore: number) => void;
  className?: string;
  size?: "default" | "sm";
}

export function ServiziUtilityButtons({
  userId,
  mese,
  anno,
  onKmCalculated,
  onOreCalculated,
  className = "",
  size = "default"
}: ServiziUtilityButtonsProps) {
  const { data, isLoading: isLoadingQuery, isFetching, refetch } = useServiziUtente(userId, mese, anno);
  const [isFetchingKm, setIsFetchingKm] = useState(false);
  const [isFetchingOre, setIsFetchingOre] = useState(false);

  if (!userId) {
    return null;
  }

  const handleCalculateKm = async () => {
    try {
      setIsFetchingKm(true);
      const result = await refetch();
      if (result.data?.km) {
        onKmCalculated(result.data.km.kmTotali);
        toast.success(`Calcolati ${result.data.km.kmTotali} KM da ${result.data.km.servizi} servizi`);
      } else {
        toast.info("Nessun servizio trovato per il calcolo KM");
      }
    } catch (error) {
      console.error("Errore nel calcolo KM:", error);
      toast.error("Errore nel calcolo KM");
    } finally {
      setIsFetchingKm(false);
    }
  };

  const handleCalculateOre = async () => {
    try {
      setIsFetchingOre(true);
      const result = await refetch();
      if (result.data?.ore) {
        onOreCalculated(result.data.ore.oreTotali);
        toast.success(`Calcolate ${result.data.ore.oreTotali} ore da ${result.data.ore.servizi} servizi`);
      } else {
        toast.info("Nessun servizio trovato per il calcolo ore");
      }
    } catch (error) {
      console.error("Errore nel calcolo ore:", error);
      toast.error("Errore nel calcolo ore");
    } finally {
      setIsFetchingOre(false);
    }
  };

  const isButtonsDisabled = isFetching || isFetchingKm || isFetchingOre || isLoadingQuery;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleCalculateKm}
        disabled={!userId || isButtonsDisabled}
        className="flex items-center gap-2 text-xs"
      >
        {isFetchingKm ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowDownWideNarrow className="h-3 w-3" />
        )}
        Calcola KM dai servizi
      </Button>

      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleCalculateOre}
        disabled={!userId || isButtonsDisabled}
        className="flex items-center gap-2 text-xs"
      >
        {isFetchingOre ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowDownWideNarrow className="h-3 w-3" />
        )}
        Calcola ore dai servizi
      </Button>
    </div>
  );
}
