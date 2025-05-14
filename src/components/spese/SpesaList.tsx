
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Euro, Eye, FileSpreadsheet } from "lucide-react";
import { SpesaPersonale } from "@/lib/types/spese";
import { useAuth } from "@/contexts/AuthContext";
import { SpesaDetailDialog } from "./SpesaDetailDialog";

interface SpesaListProps {
  spese: SpesaPersonale[];
  isLoading?: boolean;
  canConvert?: boolean;
  onConvert?: (spesaId: string) => void;
}

export function SpesaList({ spese, isLoading = false, canConvert = false, onConvert }: SpesaListProps) {
  const { profile } = useAuth();
  const [selectedSpesa, setSelectedSpesa] = useState<SpesaPersonale | null>(null);

  const handleViewDetail = (spesa: SpesaPersonale) => {
    setSelectedSpesa(spesa);
  };

  const closeDetailDialog = () => {
    setSelectedSpesa(null);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spese Personali</CardTitle>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Esporta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p>Caricamento...</p>
          </div>
        ) : spese.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Nessuna spesa registrata</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Non ci sono spese personali registrate. Clicca su "Registra Nuova Spesa" per aggiungerne una.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Causale</TableHead>
                  {profile && (profile.role === 'admin' || profile.role === 'socio') && (
                    <TableHead>Utente</TableHead>
                  )}
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spese.map((spesa) => (
                  <TableRow key={spesa.id}>
                    <TableCell>{format(new Date(spesa.data), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatAmount(spesa.importo)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={spesa.causale}>
                      {spesa.causale}
                    </TableCell>
                    {profile && (profile.role === 'admin' || profile.role === 'socio') && (
                      <TableCell>
                        {spesa.user ? `${spesa.user.first_name} ${spesa.user.last_name}` : ''}
                      </TableCell>
                    )}
                    <TableCell>
                      {spesa.convertita_aziendale ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Convertita
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Personale
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetail(spesa)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canConvert && !spesa.convertita_aziendale && onConvert && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => onConvert(spesa.id)}
                          >
                            Converti
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {selectedSpesa && (
        <SpesaDetailDialog 
          spesa={selectedSpesa} 
          open={!!selectedSpesa} 
          onOpenChange={closeDetailDialog} 
        />
      )}
    </Card>
  );
}
