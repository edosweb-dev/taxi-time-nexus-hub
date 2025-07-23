import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';
import { Profile } from '@/lib/types';
import { UserEmailField } from '../form-fields';

interface UserContactInfoSectionProps {
  control: Control<any>;
  isEditing: boolean;
  userEmail?: string;
}

export function UserContactInfoSection({ control, isEditing, userEmail }: UserContactInfoSectionProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="card-title flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Informazioni di Contatto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserEmailField 
          control={control} 
          isEditing={isEditing} 
          userEmail={userEmail}
        />
        
        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefono
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Inserisci numero di telefono" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}