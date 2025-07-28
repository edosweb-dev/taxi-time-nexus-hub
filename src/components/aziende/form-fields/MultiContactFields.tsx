import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Control } from "react-hook-form";
import { Plus, Trash2, Mail, Phone } from "lucide-react";

interface MultiContactFieldsProps {
  control: Control<any>;
}

export function MultiContactFields({ control }: MultiContactFieldsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Emails */}
      <FormField
        control={control}
        name="emails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Indirizzi Email
            </FormLabel>
            <div className="space-y-3">
              {(field.value || []).map((email: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={`Email ${index + 1}`}
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...(field.value || [])];
                        newEmails[index] = e.target.value;
                        field.onChange(newEmails);
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newEmails = (field.value || []).filter((_: string, i: number) => i !== index);
                      field.onChange(newEmails);
                    }}
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEmails = [...(field.value || []), ''];
                  field.onChange(newEmails);
                }}
                className="w-full justify-center"
              >
                <Plus className="h-3 w-3 mr-2" />
                Aggiungi Email
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Telefoni */}
      <FormField
        control={control}
        name="telefoni"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Numeri di Telefono
            </FormLabel>
            <div className="space-y-3">
              {(field.value || []).map((telefono: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={`Telefono ${index + 1}`}
                      value={telefono}
                      onChange={(e) => {
                        const newTelefoni = [...(field.value || [])];
                        newTelefoni[index] = e.target.value;
                        field.onChange(newTelefoni);
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newTelefoni = (field.value || []).filter((_: string, i: number) => i !== index);
                      field.onChange(newTelefoni);
                    }}
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newTelefoni = [...(field.value || []), ''];
                  field.onChange(newTelefoni);
                }}
                className="w-full justify-center"
              >
                <Plus className="h-3 w-3 mr-2" />
                Aggiungi Telefono
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}