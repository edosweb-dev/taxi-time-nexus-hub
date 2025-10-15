import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User, Palette } from 'lucide-react';
import { UserNameFields } from '../form-fields';
import { UserRole } from '@/lib/types';

interface UserMainInfoSectionProps {
  control: Control<any>;
  isEditing: boolean;
  userRole?: UserRole;
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#FB7185'
];

export function UserMainInfoSection({ control, isEditing, userRole }: UserMainInfoSectionProps) {
  // Only show color picker for employees (admin, socio, dipendente)
  const showColorPicker = userRole && ['admin', 'socio', 'dipendente'].includes(userRole);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="card-title flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informazioni Principali
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserNameFields control={control} isEditing={isEditing} />
        
        {showColorPicker && (
          <FormField
            control={control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colore Calendario
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color 
                              ? 'border-ring ring-2 ring-ring ring-offset-2' 
                              : 'border-border hover:border-ring'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={field.value || '#3B82F6'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-16 h-8 p-0 border-0 cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">
                        Colore personalizzato: {field.value || 'Nessuno'}
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}