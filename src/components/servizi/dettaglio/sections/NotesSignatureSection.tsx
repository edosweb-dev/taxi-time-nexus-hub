import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Servizio } from "@/lib/types/servizi";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface NotesSignatureSectionProps {
  servizio: Servizio;
  firmaDigitaleAttiva: boolean;
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
  totalPasseggeri?: number;
  passeggeri?: any[];
}

export function NotesSignatureSection({
  servizio,
  firmaDigitaleAttiva,
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
  totalPasseggeri = 0,
  passeggeri = [],
}: NotesSignatureSectionProps) {
  const hasContent = servizio.note || (firmaDigitaleAttiva && (allPasseggeriSigned || firmePasseggeri > 0));
  
  // Filtra solo i passeggeri che hanno firmato
  const passeggeriConFirma = passeggeri.filter(p => p.firma_url);

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
            {allPasseggeriSigned ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {totalPasseggeri > 1 
                      ? `Tutti i passeggeri hanno firmato (${totalPasseggeri}/${totalPasseggeri})`
                      : 'Cliente ha firmato'
                    }
                  </Badge>
                </div>
                
                {/* Griglia firme multiple passeggeri */}
                {totalPasseggeri > 1 && passeggeriConFirma.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Firme Raccolte</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {passeggeriConFirma.map((passeggero, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-muted/30 space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{passeggero.nome_cognome}</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                              ✓ Firmato
                            </Badge>
                          </div>
                          {passeggero.firma_timestamp && (
                            <p className="text-xs text-muted-foreground">
                              {safeFormat(passeggero.firma_timestamp, "dd/MM/yyyy 'alle' HH:mm")}
                            </p>
                          )}
                          <div className="border rounded p-2 bg-white dark:bg-card">
                            <img 
                              src={passeggero.firma_url} 
                              alt={`Firma ${passeggero.nome_cognome}`}
                              className="w-full h-auto max-h-24 object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Firma singola cliente */
                  servizio.firma_url && (
                    <div className="space-y-2">
                      {servizio.firma_timestamp && (
                        <p className="text-sm text-muted-foreground">
                          Firmato il {safeFormat(servizio.firma_timestamp, "dd/MM/yyyy 'alle' HH:mm")}
                        </p>
                      )}
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <img 
                          src={servizio.firma_url} 
                          alt="Firma cliente" 
                          className="max-w-full h-auto border rounded"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  {totalPasseggeri > 1 
                    ? `In attesa firme (${firmePasseggeri}/${totalPasseggeri})`
                    : 'In attesa firma cliente'
                  }
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {totalPasseggeri > 1
                    ? `${firmePasseggeri} su ${totalPasseggeri} passeggeri hanno firmato`
                    : 'Il cliente non ha ancora firmato digitalmente il servizio'
                  }
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}