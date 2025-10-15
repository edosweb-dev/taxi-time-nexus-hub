import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Trash2,
  Users
} from "lucide-react";
import { usePasseggeriCliente } from "@/hooks/usePasseggeriCliente";

const PasseggeriCliente = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { passeggeri, isLoading } = usePasseggeriCliente(searchTerm);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard-cliente")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">I Miei Passeggeri</h1>
              <p className="text-muted-foreground">
                Gestisci i contatti per i tuoi servizi
              </p>
            </div>
          </div>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Passeggero
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cerca passeggero per nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {passeggeri.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {passeggeri.length} passeggeri trovati
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lista Passeggeri */}
        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : passeggeri.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nessun passeggero trovato
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? `Nessun risultato per "${searchTerm}"`
                  : "Non hai ancora aggiunto nessun passeggero"}
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Primo Passeggero
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* DESKTOP: Tabella */}
            <div className="hidden md:block">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contatti</TableHead>
                      <TableHead>Località</TableHead>
                      <TableHead>Indirizzo</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passeggeri.map((passeggero) => (
                      <TableRow key={passeggero.id}>
                        {/* Nome */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {passeggero.nome_cognome}
                            </span>
                          </div>
                        </TableCell>

                        {/* Contatti */}
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {passeggero.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate max-w-[200px]">
                                  {passeggero.email}
                                </span>
                              </div>
                            )}
                            {passeggero.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{passeggero.telefono}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Località */}
                        <TableCell>
                          {passeggero.localita || (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>

                        {/* Indirizzo */}
                        <TableCell className="max-w-[200px]">
                          {passeggero.indirizzo ? (
                            <span className="text-sm truncate block">
                              {passeggero.indirizzo}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>

                        {/* Azioni */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* MOBILE: Cards */}
            <div className="md:hidden space-y-4">
              {passeggeri.map((passeggero) => (
                <Card key={passeggero.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {passeggero.nome_cognome}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Contatti */}
                    {passeggero.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{passeggero.email}</span>
                      </div>
                    )}
                    {passeggero.telefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{passeggero.telefono}</span>
                      </div>
                    )}

                    {/* Località + Indirizzo */}
                    {(passeggero.localita || passeggero.indirizzo) && (
                      <div className="flex items-start gap-2 text-sm pt-2 border-t">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {passeggero.localita && (
                            <p className="font-medium">{passeggero.localita}</p>
                          )}
                          {passeggero.indirizzo && (
                            <p className="text-muted-foreground break-words">
                              {passeggero.indirizzo}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Azioni */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-2" />
                        Modifica
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-destructive">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Elimina
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PasseggeriCliente;
