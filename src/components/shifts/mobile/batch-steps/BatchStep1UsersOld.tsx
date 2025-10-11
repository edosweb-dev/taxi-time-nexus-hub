import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface BatchStep1UsersProps {
  control: Control<any>;
  users: User[];
  isAdminOrSocio: boolean;
}

export function BatchStep1Users({ control, users, isAdminOrSocio }: BatchStep1UsersProps) {
  if (!isAdminOrSocio) {
    // If not admin/socio, automatically set current user
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <User className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              I turni verranno creati per il tuo utente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const employees = users.filter(user => ['dipendente', 'admin', 'socio'].includes(user.role));

  const getUserDisplayName = (user: User) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.id;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Seleziona Dipendenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="selectedUsers"
            render={() => (
              <FormItem>
                <div className="space-y-1">
                  {employees.map((user) => (
                    <FormField
                      key={user.id}
                      control={control}
                      name="selectedUsers"
                      render={({ field }) => (
                        <FormItem
                          key={user.id}
                          className="flex flex-row items-center space-x-2 space-y-0 py-1"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(user.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, user.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== user.id
                                      )
                                    );
                              }}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal cursor-pointer">
                            <div>
                              <div className="font-medium text-sm">{getUserDisplayName(user)}</div>
                              <div className="text-xs text-muted-foreground capitalize opacity-70">
                                {user.role}
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {employees.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Users className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nessun dipendente disponibile
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}