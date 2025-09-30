import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control, useWatch } from 'react-hook-form';

interface MobileSettingsFieldsProps {
  control: Control<any>;
}

export function MobileSettingsFields({ control }: MobileSettingsFieldsProps) {
  const provvigioneAttiva = useWatch({
    control,
    name: 'provvigione',
    defaultValue: false,
  });

  const provvigioneTipo = useWatch({
    control,
    name: 'provvigione_tipo',
    defaultValue: 'fisso',
  });

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="firma_digitale_attiva"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Firma Digitale</FormLabel>
              <FormDescription className="text-xs">
                Abilita la firma digitale per i servizi
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

      <FormField
        control={control}
        name="provvigione"
        render={({ field }) => (
          <FormItem className="flex flex-col rounded-lg border p-4 space-y-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Provvigione</FormLabel>
                <FormDescription className="text-xs">
                  Abilita la gestione delle provvigioni
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>

            {provvigioneAttiva && (
              <div className="space-y-4 pt-2">
                <div>
                  <FormLabel className="text-sm mb-3 block">Tipo Provvigione</FormLabel>
                  <FormField
                    control={control}
                    name="provvigione_tipo"
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === 'fisso' ? 'default' : 'outline'}
                          className="min-h-[48px]"
                          onClick={() => field.onChange('fisso')}
                        >
                          Importo Fisso
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'percentuale' ? 'default' : 'outline'}
                          className="min-h-[48px]"
                          onClick={() => field.onChange('percentuale')}
                        >
                          Percentuale
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="provvigione_valore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valore Provvigione</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          placeholder="Inserisci il valore"
                          {...field}
                          className="text-base"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {provvigioneTipo === 'percentuale'
                          ? 'Inserisci la percentuale (es. 10 per 10%)'
                          : 'Inserisci il valore fisso in euro'
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
