import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const passeggeroSchema = z.object({
  nome_cognome: z.string()
    .min(2, "Nome e cognome richiesto (min 2 caratteri)")
    .max(100, "Massimo 100 caratteri"),
  email: z.string()
    .email("Email non valida")
    .optional()
    .or(z.literal("")),
  telefono: z.string()
    .max(20, "Massimo 20 caratteri")
    .optional(),
  localita: z.string()
    .max(50, "Massimo 50 caratteri")
    .optional(),
  indirizzo: z.string()
    .max(200, "Massimo 200 caratteri")
    .optional(),
});

type PasseggeroFormData = z.infer<typeof passeggeroSchema>;

const PasseggeriCliente = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPasseggero, setEditingPasseggero] = useState<any | null>(null);
  const [deletingPasseggero, setDeletingPasseggero] = useState<any | null>(null);

  const { passeggeri, isLoading } = usePasseggeriCliente(searchTerm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PasseggeroFormData>({
    resolver: zodResolver(passeggeroSchema),
    defaultValues: {
      nome_cognome: "",
      email: "",
      telefono: "",
      localita: "",
      indirizzo: "",
    },
  });

  // Reset form when dialog opens/closes or editing mode changes
  useEffect(() => {
    if (dialogOpen) {
      if (editingPasseggero) {
        // EDIT mode: pre-populate with existing data
        form.reset({
          nome_cognome: editingPasseggero.nome_cognome || "",
          email: editingPasseggero.email || "",
          telefono: editingPasseggero.telefono || "",
          localita: editingPasseggero.localita || "",
          indirizzo: editingPasseggero.indirizzo || "",
        });
      } else {
        // CREATE mode: empty form
        form.reset({
          nome_cognome: "",
          email: "",
          telefono: "",
          localita: "",
          indirizzo: "",
        });
      }
    }
  }, [dialogOpen, editingPasseggero, form]);

  // CREATE Mutation
  const createMutation = useMutation({
    mutationFn: async (data: PasseggeroFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("azienda_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase.from("passeggeri").insert({
        nome_cognome: data.nome_cognome,
        email: data.email || null,
        telefono: data.telefono || null,
        localita: data.localita || null,
        indirizzo: data.indirizzo || null,
        azienda_id: profile?.azienda_id,
        referente_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passeggeri-cliente"] });
      toast({
        title: "✅ Passeggero creato",
        description: "Il passeggero è stato aggiunto con successo.",
      });
      setDialogOpen(false);
      setEditingPasseggero(null);
    },
    onError: (error: Error) => {
      console.error("[createMutation] Error:", error);
      toast({
        title: "❌ Errore",
        description: `Impossibile creare passeggero: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // UPDATE Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PasseggeroFormData) => {
      if (!editingPasseggero) throw new Error("No passenger to update");

      const { error } = await supabase
        .from("passeggeri")
        .update({
          nome_cognome: data.nome_cognome,
          email: data.email || null,
          telefono: data.telefono || null,
          localita: data.localita || null,
          indirizzo: data.indirizzo || null,
        })
        .eq("id", editingPasseggero.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passeggeri-cliente"] });
      toast({
        title: "✅ Passeggero aggiornato",
        description: "Le modifiche sono state salvate.",
      });
      setDialogOpen(false);
      setEditingPasseggero(null);
    },
    onError: (error: Error) => {
      console.error("[updateMutation] Error:", error);
      toast({
        title: "❌ Errore",
        description: `Impossibile aggiornare passeggero: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // DELETE Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("passeggeri")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passeggeri-cliente"] });
      toast({
        title: "🗑️ Passeggero eliminato",
        description: "Il passeggero è stato rimosso.",
      });
      setDeleteDialogOpen(false);
      setDeletingPasseggero(null);
    },
    onError: (error: Error) => {
      console.error("[deleteMutation] Error:", error);
      toast({
        title: "❌ Errore",
        description: `Impossibile eliminare passeggero: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PasseggeroFormData) => {
    if (editingPasseggero) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

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

          <Button
            onClick={() => {
              setEditingPasseggero(null);
              setDialogOpen(true);
            }}
          >
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
                <Button
                  onClick={() => {
                    setEditingPasseggero(null);
                    setDialogOpen(true);
                  }}
                >
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingPasseggero(passeggero);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingPasseggero(passeggero);
                                setDeleteDialogOpen(true);
                              }}
                            >
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditingPasseggero(passeggero);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Modifica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        onClick={() => {
                          setDeletingPasseggero(passeggero);
                          setDeleteDialogOpen(true);
                        }}
                      >
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

      {/* Dialog CREATE/EDIT Passeggero */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPasseggero ? "Modifica Passeggero" : "Nuovo Passeggero"}
            </DialogTitle>
            <DialogDescription>
              {editingPasseggero
                ? "Aggiorna i dati del passeggero"
                : "Aggiungi un nuovo passeggero alla tua lista"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Nome Cognome */}
              <FormField
                control={form.control}
                name="nome_cognome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome e Cognome <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="mario.rossi@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Telefono */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="+39 123 456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Località */}
              <FormField
                control={form.control}
                name="localita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Località</FormLabel>
                    <FormControl>
                      <Input placeholder="Milano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Indirizzo */}
              <FormField
                control={form.control}
                name="indirizzo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo</FormLabel>
                    <FormControl>
                      <Input placeholder="Via Roma 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingPasseggero(null);
                  }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvataggio..."
                    : editingPasseggero
                    ? "Salva Modifiche"
                    : "Crea Passeggero"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog DELETE Conferma */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il passeggero{" "}
              <span className="font-semibold">
                {deletingPasseggero?.nome_cognome}
              </span>
              ? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPasseggero) {
                  deleteMutation.mutate(deletingPasseggero.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default PasseggeriCliente;
