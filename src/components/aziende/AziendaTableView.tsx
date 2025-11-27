import { Azienda } from '@/lib/types';
import { useAllReferenti } from '@/hooks/useReferenti';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  CreditCard
} from 'lucide-react';

interface AziendaTableViewProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
}

export function AziendaTableView({ aziende, onEdit, onDelete, onView }: AziendaTableViewProps) {
  const { data: referentiByAzienda = {} } = useAllReferenti();

  return (
    <div className="space-y-4">

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Azienda</TableHead>
              <TableHead className="min-w-[250px]">Contatti</TableHead>
              <TableHead className="min-w-[200px]">Indirizzo</TableHead>
              <TableHead className="text-center w-[100px]">Referenti</TableHead>
              <TableHead className="text-center w-[180px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aziende.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Nessuna azienda presente
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Aggiungi la prima azienda per iniziare.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              aziende.map((azienda) => {
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
                          <Link 
                            to={`/aziende/${azienda.id}`}
                            className="font-semibold text-foreground leading-tight break-words hover:text-primary transition-colors cursor-pointer"
                          >
                            {azienda.nome}
                          </Link>
                          {azienda.citta && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {azienda.citta}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1.5">
                        {azienda.email && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="break-all leading-tight">{azienda.email}</span>
                          </div>
                        )}
                        {azienda.telefono && (
                          <div className="flex items-center space-x-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="leading-tight">{azienda.telefono}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {(azienda.indirizzo || azienda.citta) && (
                        <div className="flex items-start space-x-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            {azienda.indirizzo && (
                              <p className="leading-tight break-words">{azienda.indirizzo}</p>
                            )}
                            {azienda.citta && (
                              <p className="leading-tight text-muted-foreground break-words">{azienda.citta}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{referentiCount}</span>
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
    </div>
  );
}