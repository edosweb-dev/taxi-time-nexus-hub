import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovimentiFilters } from "@/components/spese/MovimentiFilters";
import { MovimentiList } from "@/components/spese/MovimentiList";
import { NuovoMovimentoForm } from "@/components/spese/NuovoMovimentoForm";
import { useAuth } from "@/contexts/AuthContext";
import { getMovimenti } from "@/lib/api/spese";
import { MovimentoAziendale, GetMovimentiOptions } from "@/lib/types/spese";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export default function MovimentiPage() {
  const { profile } = useAuth();
  const [movimenti, setMovimenti] = useState<MovimentoAziendale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<GetMovimentiOptions>({});

  const isAdminOrSocio = profile?.role === "admin" || profile?.role === "socio";

  useEffect(() => {
    if (!isAdminOrSocio) return;
    loadMovimenti();
  }, [profile, filters, isAdminOrSocio]);

  const loadMovimenti = async () => {
    if (!isAdminOrSocio) return;
    
    try {
      setIsLoading(true);
      const data = await getMovimenti(filters);
      setMovimenti(data);
    } catch (error) {
      console.error("Errore nel caricamento dei movimenti:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei movimenti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: GetMovimentiOptions) => {
    setFilters(newFilters);
  };

  const handleMovimentoCreated = () => {
    loadMovimenti();
  };

  const handleChangeStato = async (id: string, stato: "saldato" | "pending") => {
    try {
      const { error } = await supabase
        .from("movimenti_aziendali")
        .update({ stato })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Stato aggiornato",
        description: `Il movimento è ora ${stato === "saldato" ? "saldato" : "da saldare"}.`,
      });

      loadMovimenti();
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiornamento dello stato.",
        variant: "destructive",
      });
    }
  };

  // Se l'utente non è admin o socio, reindirizza o mostra un messaggio
  if (!isAdminOrSocio) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh] flex-col space-y-4">
          <h1 className="text-2xl font-bold">Accesso negato</h1>
          <p className="text-muted-foreground">
            Solo gli amministratori e i soci possono accedere a questa pagina.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimenti Aziendali</h1>
          <p className="text-muted-foreground">
            Gestisci spese, incassi e prelievi dell'azienda
          </p>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista Movimenti</TabsTrigger>
            <TabsTrigger value="nuovo">Nuovo Movimento</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <MovimentiFilters
              onFiltersChange={handleFiltersChange}
              showUserFilter={true}
              showTipoFilter={true}
              showStatoFilter={true}
            />

            <MovimentiList
              movimenti={movimenti}
              isLoading={isLoading}
              showActions={true}
              onChangeStato={handleChangeStato}
            />
          </TabsContent>

          <TabsContent value="nuovo">
            <NuovoMovimentoForm onMovimentoCreated={handleMovimentoCreated} />
          </TabsContent>

          <TabsContent value="report">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium">Report mensile</h3>
              <p className="text-sm text-muted-foreground mt-2">
                La funzionalità di report sarà disponibile presto.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
