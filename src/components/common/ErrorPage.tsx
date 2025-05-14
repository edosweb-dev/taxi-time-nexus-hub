
import React from "react";
import { useRouteError } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError() as any;
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-xl mb-6">Si è verificato un errore.</p>
        
        {error && (
          <div className="bg-muted p-4 rounded-lg mb-6 max-w-md">
            <p className="text-muted-foreground">
              {error.statusText || error.message || "Errore sconosciuto"}
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => window.location.href = '/'}
          variant="default"
        >
          Torna alla Home
        </Button>
      </div>
    </MainLayout>
  );
}
