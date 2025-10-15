import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';

interface UserCompanySectionProps {
  control: Control<any>;
}

export function UserCompanySection({ control }: UserCompanySectionProps) {
  const { aziende, isLoading } = useAziende();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="card-title flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Azienda di Riferimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="azienda_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Azienda</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un'azienda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {aziende?.map((azienda) => (
                    <SelectItem key={azienda.id} value={azienda.id}>
                      {azienda.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
