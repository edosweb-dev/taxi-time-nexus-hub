import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Servizio } from "@/lib/types/servizi";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface NotesSignatureSectionProps {
  servizio: Servizio;
  firmaDigitaleAttiva: boolean;
}

export function NotesSignatureSection({
  servizio,
  firmaDigitaleAttiva,
}: NotesSignatureSectionProps) {
  const hasContent = servizio.note || (firmaDigitaleAttiva && (servizio.firma_url || servizio.firma_timestamp));

  const safeFormat = (value?: string | Date, fmt: string = "dd/MM/yyyy 'alle' HH:mm") => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    try {
      return format(d, fmt, { locale: it });
    } catch {
      return "—";
    }
  };

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-6">
      {servizio.note && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Note del servizio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {servizio.note}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {firmaDigitaleAttiva && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Firma Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {servizio.firma_url ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Cliente ha firmato
                  </Badge>
                  {servizio.firma_timestamp && (
                    <span className="text-sm text-muted-foreground">
                      il {safeFormat(servizio.firma_timestamp, "dd/MM/yyyy 'alle' HH:mm")}
                    </span>
                  )}
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <img 
                    src={servizio.firma_url} 
                    alt="Firma cliente" 
                    className="max-w-full h-auto border rounded"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  In attesa firma cliente
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Il cliente non ha ancora firmato digitalmente il servizio
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}