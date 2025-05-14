
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { createSpesa } from "@/lib/api/spese";
import { SpesaPersonaleFormData } from "@/lib/types/spese";

const formSchema = z.object({
  data: z.date(),
  importo: z.coerce.number().positive({ message: "L'importo deve essere maggiore di zero" }),
  causale: z.string().min(3, { message: "La causale deve essere di almeno 3 caratteri" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NuovaSpesaFormProps {
  onSpesaCreated?: () => void;
}

export function NuovaSpesaForm({ onSpesaCreated }: NuovaSpesaFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      importo: undefined,
      causale: "",
      note: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const spesaData: SpesaPersonaleFormData = {
        data: format(data.data, "yyyy-MM-dd"),
        importo: data.importo,
        causale: data.causale,
        note: data.note,
      };

      await createSpesa(spesaData);
      
      toast({
        title: "Spesa registrata",
        description: "La spesa è stata registrata con successo.",
      });
      
      form.reset({
        data: new Date(),
        importo: undefined,
        causale: "",
        note: "",
      });
      
      if (onSpesaCreated) {
        onSpesaCreated();
      }
    } catch (error) {
      console.error("Errore durante la registrazione della spesa:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione della spesa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registra Nuova Spesa</CardTitle>
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

            <FormField
              control={form.control}
              name="causale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Causale</FormLabel>
                  <FormControl>
                    <Input placeholder="Causale della spesa" {...field} />
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
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive sulla spesa"
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
              {form.formState.isSubmitting ? "Registrazione..." : "Registra Spesa"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
