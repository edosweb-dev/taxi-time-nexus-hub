import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface MobileContactFieldsProps {
  control: Control<any>;
}

export function MobileContactFields({ control }: MobileContactFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Contatti principali */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Principale</FormLabel>
              <FormControl>
                <Input 
                  placeholder="email@esempio.it" 
                  {...field} 
                  value={field.value || ''}
                  type="email"
                  autoComplete="email"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono Principale</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+39 123 456 7890" 
                  {...field} 
                  value={field.value || ''}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Email aggiuntive */}
      <FormField
        control={control}
        name="emails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Aggiuntive</FormLabel>
            <div className="space-y-3">
              {(field.value || []).map((email: string, index: number) => (
                <Card key={index} className="p-3">
                  <div className="space-y-2">
                    <FormControl>
                      <Input
                        placeholder={`Email ${index + 1}`}
                        value={email}
                        type="email"
                        autoComplete="email"
                        className="text-base"
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
                      size="sm"
                      onClick={() => {
                        const newEmails = (field.value || []).filter((_: string, i: number) => i !== index);
                        field.onChange(newEmails);
                      }}
                      className="w-full min-h-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Rimuovi Email
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEmails = [...(field.value || []), ''];
                  field.onChange(newEmails);
                }}
                className="w-full min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Email
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Telefoni aggiuntivi */}
      <FormField
        control={control}
        name="telefoni"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefoni Aggiuntivi</FormLabel>
            <div className="space-y-3">
              {(field.value || []).map((telefono: string, index: number) => (
                <Card key={index} className="p-3">
                  <div className="space-y-2">
                    <FormControl>
                      <Input
                        placeholder={`Telefono ${index + 1}`}
                        value={telefono}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="text-base"
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
                      size="sm"
                      onClick={() => {
                        const newTelefoni = (field.value || []).filter((_: string, i: number) => i !== index);
                        field.onChange(newTelefoni);
                      }}
                      className="w-full min-h-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Rimuovi Telefono
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newTelefoni = [...(field.value || []), ''];
                  field.onChange(newTelefoni);
                }}
                className="w-full min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
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
