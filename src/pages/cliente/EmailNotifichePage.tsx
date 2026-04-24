import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, ArrowLeft, Mail, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailNotifiche } from "@/hooks/useEmailNotifiche";
import { EmailNotifica } from "@/lib/types/emailNotifiche";

const formSchema = z.object({
  nome: z.string().min(1, "Nome obbligatorio"),
  email: z.string().email("Email non valida"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmailNotifichePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const aziendaId = profile?.azienda_id;

  const {
    emailNotifiche,
    isLoading,
    createEmailNotifica,
    updateEmailNotifica,
    deleteEmailNotifica,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEmailNotifiche(aziendaId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailNotifica | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<EmailNotifica | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "", note: "" },
  });

  const handleOpenNew = () => {
    setEditingEmail(null);
    form.reset({ nome: "", email: "", note: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (email: EmailNotifica) => {
    setEditingEmail(email);
    form.reset({ nome: email.nome, email: email.email, note: email.note || "" });
    setDialogOpen(true);
  };

  const handleSubmit = (values: FormValues) => {
    if (!aziendaId) return;
    if (editingEmail) {
      updateEmailNotifica({
        id: editingEmail.id,
        nome: values.nome,
        email: values.email,
        note: values.note || undefined,
      });
    } else {
      createEmailNotifica({
        nome: values.nome,
        email: values.email,
        azienda_id: aziendaId,
        note: values.note || undefined,
      });
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (emailToDelete) {
      deleteEmailNotifica(emailToDelete.id);
      setEmailToDelete(null);
    }
  };

  const emailsFiltered = (emailNotifiche || []).filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      e.nome.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard-cliente")}
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Email Notifiche</h1>
              <p className="text-sm text-muted-foreground">
                Gestisci gli indirizzi email che riceveranno le notifiche dei tuoi servizi
              </p>
            </div>
          </div>
          <Button onClick={handleOpenNew} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Email
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Indirizzi Configurati ({emailsFiltered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : emailsFiltered.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {search ? "Nessun indirizzo trovato" : "Nessun indirizzo configurato"}
                </p>
                {!search && (
                  <Button onClick={handleOpenNew} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi il primo indirizzo
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Note</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailsFiltered.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{email.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[240px] truncate">
                          {email.note || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(email)}
                              aria-label={`Modifica ${email.nome}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setEmailToDelete(email)}
                              aria-label={`Elimina ${email.nome}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Add/Edit */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmail ? "Modifica indirizzo email" : "Nuovo indirizzo email"}
              </DialogTitle>
              <DialogDescription>
                {editingEmail
                  ? "Modifica i dati dell'indirizzo email di notifica."
                  : "Aggiungi un indirizzo email che riceverà le notifiche dei servizi."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome contatto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Ufficio operativo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="operativo@azienda.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (opzionali)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Eventuali note sull'indirizzo..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>
                    {editingEmail
                      ? isUpdating
                        ? "Aggiornamento..."
                        : "Salva modifiche"
                      : isCreating
                      ? "Salvataggio..."
                      : "Aggiungi"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* AlertDialog Delete */}
        <AlertDialog
          open={!!emailToDelete}
          onOpenChange={(open) => !open && setEmailToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Elimina indirizzo email</AlertDialogTitle>
              <AlertDialogDescription>
                Vuoi davvero eliminare <strong>{emailToDelete?.nome}</strong> ({emailToDelete?.email})?
                L'indirizzo non verrà più proposto nelle future richieste.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
