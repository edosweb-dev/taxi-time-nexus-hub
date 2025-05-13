
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layouts/MainLayout";

interface ServizioLoadingProps {
  message?: string;
}

export function ServizioLoading({ message = "Caricamento servizio..." }: ServizioLoadingProps) {
  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">{message}</span>
      </div>
    </MainLayout>
  );
}

interface ServizioErrorProps {
  message?: string;
}

export function ServizioError({ message = "Si è verificato un errore nel caricamento del servizio o il servizio non esiste." }: ServizioErrorProps) {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Errore</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={() => navigate("/servizi")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna ai servizi
        </Button>
      </div>
    </MainLayout>
  );
}
