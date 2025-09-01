import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Trash2, AlertCircle } from "lucide-react";
import { useEmailNotifiche } from "@/hooks/useEmailNotifiche";
import { ServizioFormData } from "@/lib/types/servizi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NotificheEmailField() {
  const { control, watch, setValue } = useFormContext<ServizioFormData>();
  const aziendaId = watch("azienda_id");
  const { emailNotifiche, createEmailNotifica, deleteEmailNotifica, isCreating } = useEmailNotifiche(aziendaId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ nome: "", email: "", note: "" });

  // Watch per i valori selezionati
  const emailSelezionate = watch("email_notifiche") || [];

  const handleEmailToggle = (emailId: string, checked: boolean) => {
    const currentEmails = emailSelezionate;
    if (checked) {
      setValue("email_notifiche", [...currentEmails, emailId]);
    } else {
      setValue("email_notifiche", currentEmails.filter(id => id !== emailId));
    }
  };

  const handleAddEmail = () => {
    if (newEmail.nome && newEmail.email && aziendaId) {
      createEmailNotifica({
        nome: newEmail.nome,
        email: newEmail.email,
        note: newEmail.note,
        azienda_id: aziendaId
      });
      setNewEmail({ nome: "", email: "", note: "" });
      setIsDialogOpen(false);
    }
  };

  // Se non è stata selezionata un'azienda, mostra un avviso
  if (!aziendaId) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-medium text-foreground">Notifiche Email</h4>
          <p className="text-sm text-muted-foreground">
            Seleziona gli indirizzi che riceveranno le notifiche di aggiornamento stato servizio
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seleziona prima un'azienda per configurare le notifiche email
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-medium text-foreground">Notifiche Email</h4>
          <p className="text-sm text-muted-foreground">
            Seleziona gli indirizzi che riceveranno le notifiche di aggiornamento stato servizio
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Indirizzo Email</DialogTitle>
              <DialogDescription>
                Crea un nuovo indirizzo email per le notifiche dei servizi di questa azienda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome/Descrizione</label>
                <Input
                  placeholder="Es. Ufficio operativo"
                  value={newEmail.nome}
                  onChange={(e) => setNewEmail({ ...newEmail, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Indirizzo Email</label>
                <Input
                  type="email"
                  placeholder="operativo@azienda.com"
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note (opzionale)</label>
                <Input
                  placeholder="Note aggiuntive..."
                  value={newEmail.note}
                  onChange={(e) => setNewEmail({ ...newEmail, note: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleAddEmail} disabled={isCreating || !newEmail.nome || !newEmail.email}>
                {isCreating ? "Aggiungendo..." : "Aggiungi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <FormField
        control={control}
        name="email_notifiche"
        render={() => (
          <FormItem>
            <FormControl>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4" />
                    Indirizzi Email per questa Azienda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emailNotifiche.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nessun indirizzo email configurato per questa azienda</p>
                      <p className="text-sm">Aggiungi il primo indirizzo per iniziare</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emailNotifiche.map((email) => (
                        <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={emailSelezionate.includes(email.id)}
                              onCheckedChange={(checked) => 
                                handleEmailToggle(email.id, checked as boolean)
                              }
                            />
                            <div>
                              <div className="font-medium">{email.nome}</div>
                              <div className="text-sm text-muted-foreground">{email.email}</div>
                              {email.note && (
                                <div className="text-xs text-muted-foreground italic mt-1">
                                  {email.note}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEmailNotifica(email.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {emailSelezionate.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Email selezionate:</p>
                      <div className="flex flex-wrap gap-2">
                        {emailSelezionate.map((emailId: string) => {
                          const email = emailNotifiche.find(e => e.id === emailId);
                          return email ? (
                            <Badge key={emailId} variant="secondary">
                              {email.nome}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FormControl>
            <FormDescription>
              Gli indirizzi selezionati riceveranno notifiche quando il servizio cambia stato
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}