import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Edit, Eye, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  slug: string;
  nome: string;
  descrizione: string | null;
  subject: string;
  titolo: string | null;
  intro: string | null;
  chiusura: string | null;
  colore_header: string | null;
  attivo: boolean | null;
  variabili_disponibili: unknown;
}

export default function ImpostazioniTemplateEmailPage() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    titolo: "",
    intro: "",
    chiusura: "",
    colore_header: "#3b82f6",
    attivo: true,
  });
  const [previewTab, setPreviewTab] = useState("editor");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("slug");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, subject, titolo, intro, chiusura, colore_header, attivo }: { id: string; subject: string; titolo: string; intro: string; chiusura: string; colore_header: string; attivo: boolean }) => {
      const { error } = await supabase
        .from("email_templates")
        .update({ subject, titolo, intro, chiusura, colore_header, attivo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Template aggiornato!" });
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setEditingTemplate(null);
    },
    onError: (err: Error) => {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setEditForm({
      subject: t.subject,
      titolo: t.titolo || "",
      intro: t.intro || "",
      chiusura: t.chiusura || "",
      colore_header: t.colore_header || "#3b82f6",
      attivo: t.attivo ?? true,
    });
    setPreviewTab("editor");
  };

  if (isLoading) {
    return (
      <MainLayout title="Template Email">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Template Email">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Template Email ({templates?.length || 0})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t.nome}</CardTitle>
                    {t.descrizione && (
                      <CardDescription className="mt-1">{t.descrizione}</CardDescription>
                    )}
                  </div>
                  <Badge variant={t.attivo ? "default" : "secondary"}>
                    {t.attivo ? "Attivo" : "Inattivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium">Oggetto:</span> {t.subject}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium">Slug:</span> {t.slug}
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                  <Edit className="h-4 w-4 mr-1" /> Modifica
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Template: {editingTemplate?.nome}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={editForm.attivo}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, attivo: v }))}
              />
              <Label>Template Attivo</Label>
            </div>

            <div className="space-y-2">
              <Label>Oggetto Email</Label>
              <Input
                value={editForm.subject}
                onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>

            <Tabs value={previewTab} onValueChange={setPreviewTab}>
              <TabsList>
                <TabsTrigger value="editor">
                  <Edit className="h-4 w-4 mr-1" /> Contenuto
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-1" /> Anteprima
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="space-y-4">
                <div className="space-y-2">
                  <Label>Titolo email (mostrato grande nell'header colorato)</Label>
                  <Input
                    value={editForm.titolo}
                    onChange={(e) => setEditForm((f) => ({ ...f, titolo: e.target.value }))}
                    placeholder="Es. Nuova richiesta di servizio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Introduzione (supporta variabili {`{{referente_nome}}`}, {`{{azienda_nome}}`}, ecc.)</Label>
                  <Textarea
                    value={editForm.intro}
                    onChange={(e) => setEditForm((f) => ({ ...f, intro: e.target.value }))}
                    rows={3}
                    placeholder="Gentile {{referente_nome}}, ti informiamo che..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chiusura</Label>
                  <Textarea
                    value={editForm.chiusura}
                    onChange={(e) => setEditForm((f) => ({ ...f, chiusura: e.target.value }))}
                    rows={2}
                    placeholder="Per qualsiasi variazione, contattaci..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colore header</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="color"
                      value={editForm.colore_header}
                      onChange={(e) => setEditForm((f) => ({ ...f, colore_header: e.target.value }))}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      value={editForm.colore_header}
                      onChange={(e) => setEditForm((f) => ({ ...f, colore_header: e.target.value }))}
                      placeholder="#3b82f6"
                      className="font-mono text-sm w-32"
                    />
                    <div className="text-xs text-muted-foreground">
                      Suggeriti: <span className="font-mono">#3b82f6</span> (blu),
                      <span className="font-mono"> #f59e0b</span> (arancio),
                      <span className="font-mono"> #10b981</span> (verde),
                      <span className="font-mono"> #ef4444</span> (rosso)
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview">
                <div className="border rounded-lg p-8 bg-muted text-center text-muted-foreground">
                  Anteprima live in arrivo nel prossimo batch.
                </div>
              </TabsContent>
            </Tabs>

            {/* Variabili disponibili */}
            {editingTemplate?.variabili_disponibili && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Variabili disponibili:</span>{" "}
                {JSON.stringify(editingTemplate.variabili_disponibili)}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Annulla
              </Button>
              <Button
                onClick={() => {
                  if (!editingTemplate) return;
                  mutation.mutate({
                    id: editingTemplate.id,
                    subject: editForm.subject,
                    titolo: editForm.titolo,
                    intro: editForm.intro,
                    chiusura: editForm.chiusura,
                    colore_header: editForm.colore_header,
                    attivo: editForm.attivo,
                  });
                }}
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
