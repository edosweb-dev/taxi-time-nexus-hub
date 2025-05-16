import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NuovaSpesaForm } from "@/components/spese/NuovaSpesaForm";
import { SpesaListFilters } from "@/components/spese/SpesaListFilters";
import { SpesaList } from "@/components/spese/SpesaList";
import { ConvertSpesaDialog } from "@/components/spese/ConvertSpesaDialog";
import { useAuth } from "@/contexts/AuthContext";
import { getSpese } from "@/lib/api/spese";
import { SpesaPersonale, GetSpeseOptions } from "@/lib/types/spese";

export default function SpesePage() {
  const { profile } = useAuth();
  const [spese, setSpese] = useState<SpesaPersonale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<GetSpeseOptions>({});
  const [spesaToConvert, setSpesaToConvert] = useState<string | null>(null);

  const isAdminOrSocio = profile?.role === "admin" || profile?.role === "socio";

  useEffect(() => {
    loadSpese();
  }, [profile, filters]);

  const loadSpese = async () => {
    try {
      setIsLoading(true);
      let options = { ...filters };

      // Se non è admin/socio, filtra per il proprio utente
      if (!isAdminOrSocio && profile) {
        options.userId = profile.id;
      }

      const data = await getSpese(options);
      setSpese(data);
    } catch (error) {
      console.error("Errore nel caricamento delle spese:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: GetSpeseOptions) => {
    setFilters(newFilters);
  };

  const handleSpesaCreated = () => {
    loadSpese();
  };

  const handleConvertSpesa = (spesaId: string) => {
    setSpesaToConvert(spesaId);
  };

  const handleConversionComplete = () => {
    loadSpese();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spese</h1>
          <p className="text-muted-foreground">
            Gestisci le tue spese personali e visualizza lo storico
          </p>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista Spese</TabsTrigger>
            <TabsTrigger value="nuova">Nuova Spesa</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <SpesaListFilters
              onFiltersChange={handleFiltersChange}
              showUserFilter={isAdminOrSocio}
            />

            <SpesaList
              spese={spese}
              isLoading={isLoading}
              canConvert={isAdminOrSocio}
              onConvert={handleConvertSpesa}
            />
          </TabsContent>

          <TabsContent value="nuova">
            <NuovaSpesaForm onSpesaCreated={handleSpesaCreated} />
          </TabsContent>
        </Tabs>
      </div>

      {spesaToConvert && (
        <ConvertSpesaDialog
          spesaId={spesaToConvert}
          open={!!spesaToConvert}
          onOpenChange={(open) => !open && setSpesaToConvert(null)}
          onConversionComplete={handleConversionComplete}
        />
      )}
    </MainLayout>
  );
}
