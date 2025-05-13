
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FirmaDisplayProps {
  firmaUrl?: string | null;
  firmaTimestamp?: string | null;
}

export function FirmaDisplay({ firmaUrl, firmaTimestamp }: FirmaDisplayProps) {
  if (!firmaUrl) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Firma Digitale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="border p-4 bg-white rounded-md">
            <img 
              src={firmaUrl} 
              alt="Firma digitale" 
              className="max-w-full h-auto"
            />
          </div>
          {firmaTimestamp && (
            <p className="text-sm text-muted-foreground">
              Firmato il: {format(new Date(firmaTimestamp), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
