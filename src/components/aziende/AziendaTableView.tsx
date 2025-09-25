import { useState, useMemo } from 'react';
import { Azienda } from '@/lib/types';
import { useAllReferenti } from '@/hooks/useReferenti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  CreditCard,
  Search
} from 'lucide-react';

interface AziendaTableViewProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
}

export function AziendaTableView({ aziende, onEdit, onDelete, onView }: AziendaTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: referentiByAzienda = {} } = useAllReferenti();

  const filteredAziende = useMemo(() => {
    if (!searchTerm) return aziende;
    
    return aziende.filter((azienda) =>
      azienda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      azienda.partita_iva.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (azienda.email && azienda.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (azienda.telefono && azienda.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (azienda.citta && azienda.citta.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [aziende, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome, P.IVA, email, telefono o città..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Azienda</TableHead>
              <TableHead className="min-w-[120px]">P.IVA</TableHead>
              <TableHead className="min-w-[160px]">Contatti</TableHead>
              <TableHead className="min-w-[180px]">Indirizzo</TableHead>
              <TableHead className="text-center min-w-[80px]">Referenti</TableHead>
              <TableHead className="text-center min-w-[80px]">Firma</TableHead>
              <TableHead className="text-center min-w-[100px]">Provvigione</TableHead>
              <TableHead className="text-center min-w-[90px]">Fatturazione</TableHead>
              <TableHead className="text-center min-w-[200px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAziende.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {searchTerm ? 'Nessun risultato trovato' : 'Nessuna azienda presente'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm 
                          ? `La ricerca "${searchTerm}" non ha prodotto risultati.`
                          : 'Aggiungi la prima azienda per iniziare.'
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAziende.map((azienda) => {
                const referentiCount = referentiByAzienda[azienda.id]?.length || 0;
                
                return (
                  <TableRow 
                    key={azienda.id} 
                    className="hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground leading-tight break-words">
                            {azienda.nome}
                          </p>
                          {azienda.citta && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {azienda.citta}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {azienda.partita_iva}
                      </code>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {azienda.email && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-1 text-xs">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="truncate max-w-[120px]">{azienda.email}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{azienda.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {azienda.telefono && (
                          <div className="flex items-center space-x-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{azienda.telefono}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {azienda.indirizzo && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-1 text-xs">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{azienda.indirizzo}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{azienda.indirizzo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{referentiCount}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant={azienda.firma_digitale_attiva ? 'success' : 'secondary'} className="text-xs">
                        {azienda.firma_digitale_attiva ? 'Attiva' : 'Disattiva'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {azienda.provvigione ? (
                        <div className="flex items-center justify-center space-x-1">
                          <CreditCard className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            {azienda.provvigione_valore}
                            {azienda.provvigione_tipo === 'percentuale' ? '%' : '€'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        {azienda.sdi && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  <FileText className="h-3 w-3 text-blue-600" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>SDI: {azienda.sdi}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {azienda.pec && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  <Mail className="h-3 w-3 text-green-600" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>PEC: {azienda.pec}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center justify-center space-x-1 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(azienda);
                                }}
                                className="h-8 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Visualizza dettagli</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(azienda);
                                }}
                                className="h-8 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifica azienda</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">Altre azioni</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(azienda);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Results count */}
      {filteredAziende.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrati {filteredAziende.length} di {aziende.length} aziende
          {searchTerm && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="ml-2 h-auto p-0 text-xs"
            >
              Cancella ricerca
            </Button>
          )}
        </div>
      )}
    </div>
  );
}