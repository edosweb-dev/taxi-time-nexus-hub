
import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ImpostazioniForm } from "@/components/impostazioni/ImpostazioniForm";
import { useImpostazioni } from "@/hooks/useImpostazioni";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImpostazioniPage() {
  const { impostazioni, isLoading, isError, error } = useImpostazioni();
  
  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Impostazioni</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci le impostazioni e le preferenze del sistema
          </p>
        </div>
        
        <Separator />
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Caricamento in corso...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Errore</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Si è verificato un errore durante il caricamento delle impostazioni: {error?.message}</p>
            </CardContent>
          </Card>
        ) : (
          <ImpostazioniForm impostazioni={impostazioni} />
        )}
      </div>
    </MainLayout>
  );
}
