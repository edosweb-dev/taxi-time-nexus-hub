
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { createMovimento, getMetodiPagamento } from "@/lib/api/spese";
import { MetodoPagamentoSpesa, MovimentoAziendaleFormData, MovimentoTipo } from "@/lib/types/spese";
import { useUsers } from "@/hooks/useUsers";

const formSchema = z.object({
  data: z.date(),
  importo: z.coerce.number().positive({ message: "L'importo deve essere maggiore di zero" }),
  causale: z.string().min(3, { message: "La causale deve essere di almeno 3 caratteri" }),
  note: z.string().optional(),
  tipo: z.enum(["spesa", "incasso", "prelievo"]),
  metodo_pagamento_id: z.string().min(1, { message: "Seleziona un metodo di pagamento" }),
  stato: z.enum(["saldato", "pending"]),
  effettuato_da_id: z.string().optional(),
  è_effettuato_da_socio: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface NuovoMovimentoFormProps {
  onMovimentoCreated?: () => void;
}

export function NuovoMovimentoForm({ onMovimentoCreated }: NuovoMovimentoFormProps) {
  const [metodiPagamento, setMetodiPagamento] = useState<MetodoPagamentoSpesa[]>([]);
  const [isLoadingMetodi, setIsLoadingMetodi] = useState(false);
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Solo soci per il campo "effettuato da"
  const soci = users.filter((user) => user.role === "socio");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      importo: undefined,
      causale: "",
      note: "",
      tipo: "spesa",
      stato: "pending",
      è_effettuato_da_socio: false,
    },
  });

  const watchTipo = form.watch("tipo");
  const watchEffettuatoDaSocio = form.watch("è_effettuato_da_socio");

  useEffect(() => {
    loadMetodiPagamento();
  }, []);

  const loadMetodiPagamento = async () => {
    setIsLoadingMetodi(true);
    try {
      const metodi = await getMetodiPagamento();
      setMetodiPagamento(metodi);
      if (metodi.length > 0) {
        form.setValue("metodo_pagamento_id", metodi[0].id);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei metodi di pagamento:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i metodi di pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMetodi(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Se non è effettuato da un socio, rimuovi il campo effettuato_da_id
      if (!data.è_effettuato_da_socio) {
        data.effettuato_da_id = undefined;
      }

      // Elimina il campo è_effettuato_da_socio che non è nel tipo MovimentoAziendaleFormData
      const { è_effettuato_da_socio, ...movimentoData } = data;

      const formattedData: MovimentoAziendaleFormData = {
        ...movimentoData,
        data: format(data.data, "yyyy-MM-dd"),
      };

      await createMovimento(formattedData);

      toast({
        title: "Movimento registrato",
        description: "Il movimento è stato registrato con successo.",
      });

      form.reset({
        data: new Date(),
        importo: undefined,
        causale: "",
        note: "",
        tipo: "spesa",
        metodo_pagamento_id: metodiPagamento.length > 0 ? metodiPagamento[0].id : "",
        stato: "pending",
        è_effettuato_da_socio: false,
      });

      if (onMovimentoCreated) {
        onMovimentoCreated();
      }
    } catch (error) {
      console.error("Errore durante la registrazione del movimento:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione del movimento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registra Nuovo Movimento</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Seleziona data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di movimento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spesa">Spesa</SelectItem>
                        <SelectItem value="incasso">Incasso</SelectItem>
                        <SelectItem value="prelievo">Prelievo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="causale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Causale</FormLabel>
                  <FormControl>
                    <Input placeholder="Causale del movimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metodo_pagamento_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo di pagamento</FormLabel>
                    {isLoadingMetodi ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Caricamento...</span>
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona metodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metodiPagamento.map((metodo) => (
                            <SelectItem key={metodo.id} value={metodo.id}>
                              {metodo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="saldato">Saldato</SelectItem>
                        <SelectItem value="pending">Da saldare</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Socio switch e selezione */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="è_effettuato_da_socio"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Effettuato da un socio</FormLabel>
                      <FormDescription>
                        Indica se questo movimento è stato effettuato da un socio
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchEffettuatoDaSocio && (
                <FormField
                  control={form.control}
                  name="effettuato_da_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleziona socio</FormLabel>
                      {isLoadingUsers ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Caricamento soci...</span>
                        </div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona un socio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soci.map((socio) => (
                              <SelectItem key={socio.id} value={socio.id}>
                                {socio.first_name} {socio.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive sul movimento"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Registrazione..." : "Registra Movimento"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Avevo dimenticato di definire la FormDescription
const FormDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);
