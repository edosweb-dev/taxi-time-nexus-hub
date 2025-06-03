
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useCalcoloStipendio } from '@/hooks/useCalcoloStipendio';
import { useConfigurazioneStipendi, useCreateStipendio } from '@/hooks/useStipendi';
import { getInitials, getRuoloBadge } from './TabellaStipendi/utils';
import { toast } from '@/components/ui/sonner';
import { ServiziUtilityButtons } from './ServiziUtilityButtons';

const stipendioSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un utente'),
  km: z.number().min(12, 'Minimo 12 km').optional(),
  ore_attesa: z.number().min(0, 'Minimo 0 ore').optional(),
  ore_lavorate: z.number().min(0, 'Minimo 0 ore').optional(),
  tariffa_oraria: z.number().min(0, 'Tariffa deve essere positiva').optional(),
  note: z.string().optional(),
});

type StipendioFormData = z.infer<typeof stipendioSchema>;

interface NuovoStipendioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth: number;
  selectedYear: number;
  onStipendioCreated: () => void;
}

export function NuovoStipendioSheet({
  open,
  onOpenChange,
  selectedMonth,
  selectedYear,
  onStipendioCreated,
}: NuovoStipendioSheetProps) {
  // Filter users to include only admin, socio, and dipendente roles
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
  
  const { data: configurazione } = useConfigurazioneStipendi(selectedYear);
  const createStipendioMutation = useCreateStipendio();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const form = useForm<StipendioFormData>({
    resolver: zodResolver(stipendioSchema),
    defaultValues: {
      user_id: '',
      km: 12,
      ore_attesa: 0,
      ore_lavorate: 0,
      tariffa_oraria: configurazione?.tariffa_oraria_attesa || 15,
      note: '',
    },
  });

  const watchedValues = form.watch();

  // Update tariffa_oraria default when configurazione loads
  useEffect(() => {
    if (configurazione?.tariffa_oraria_attesa) {
      form.setValue('tariffa_oraria', Number(configurazione.tariffa_oraria_attesa));
    }
  }, [configurazione, form]);

  // Find selected user details
  useEffect(() => {
    if (watchedValues.user_id) {
      const user = users.find(u => u.id === watchedValues.user_id);
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  }, [watchedValues.user_id, users]);

  // Calculate salary in real-time for soci
  const calcoloParams = selectedUser?.role === 'socio' && watchedValues.km && watchedValues.km >= 12 ? {
    userId: watchedValues.user_id,
    mese: selectedMonth,
    anno: selectedYear,
    km: watchedValues.km,
    oreAttesa: watchedValues.ore_attesa || 0,
  } : null;

  const { calcolo, isCalculating } = useCalcoloStipendio(calcoloParams, {
    enableRealTime: true,
    debounceMs: 500,
  });

  // Group users by role
  const groupedUsers = users.reduce((groups, user) => {
    const role = user.role === 'socio' ? 'soci' : user.role === 'admin' ? 'admin' : 'dipendenti';
    if (!groups[role]) groups[role] = [];
    groups[role].push(user);
    return groups;
  }, {} as { soci?: any[]; dipendenti?: any[]; admin?: any[] });

  const handleSubmit = async (data: StipendioFormData) => {
    try {
      console.log('[NuovoStipendioSheet] Submitting stipendio:', data);
      
      // Ensure user_id is present before calling mutation
      if (!data.user_id) {
        throw new Error('User ID is required');
      }

      await createStipendioMutation.mutateAsync({
        formData: {
          user_id: data.user_id, // Now guaranteed to be string
          km: data.km,
          ore_attesa: data.ore_attesa,
          ore_lavorate: data.ore_lavorate,
          tariffa_oraria: data.tariffa_oraria,
          note: data.note,
        },
        mese: selectedMonth,
        anno: selectedYear,
        calcolo: selectedUser?.role === 'socio' ? calcolo : null,
      });

      // Close sheet and notify parent
      onOpenChange(false);
      onStipendioCreated();
      
      // Reset form
      form.reset();
      setSelectedUser(null);
    } catch (error) {
      console.error('[NuovoStipendioSheet] Error submitting stipendio:', error);
      // Error handling is done in the mutation onError callback
    }
  };

  const isFormValid = form.formState.isValid && selectedUser && 
    (selectedUser.role === 'dipendente' || selectedUser.role === 'admin' || (selectedUser.role === 'socio' && watchedValues.km && watchedValues.km >= 12));

  const isLoading = createStipendioMutation.isPending || isCalculating;
  
  // Handlers for ServiziUtilityButtons
  const handleKmCalculated = (km: number) => {
    if (km > 0) {
      form.setValue('km', km);
    }
  };
  
  const handleOreCalculated = (ore: number) => {
    if (ore > 0) {
      if (selectedUser?.role === 'socio') {
        form.setValue('ore_attesa', ore);
      } else {
        form.setValue('ore_lavorate', ore);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Stipendio</SheetTitle>
          <SheetDescription>
            Calcola e crea un nuovo stipendio per {selectedMonth}/{selectedYear}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            {/* Sezione 1 - Selezione utente */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Seleziona Utente</h3>
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dipendente/Socio *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un utente..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groupedUsers.admin && groupedUsers.admin.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              AMMINISTRATORI
                            </div>
                            {groupedUsers.admin.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(user.first_name, user.last_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.first_name} {user.last_name}</span>
                                  {getRuoloBadge(user.role)}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {groupedUsers.soci && groupedUsers.soci.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              SOCI
                            </div>
                            {groupedUsers.soci.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(user.first_name, user.last_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.first_name} {user.last_name}</span>
                                  {getRuoloBadge(user.role)}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {groupedUsers.dipendenti && groupedUsers.dipendenti.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              DIPENDENTI
                            </div>
                            {groupedUsers.dipendenti.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(user.first_name, user.last_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.first_name} {user.last_name}</span>
                                  {getRuoloBadge(user.role)}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedUser && (
                <ServiziUtilityButtons 
                  userId={selectedUser.id}
                  mese={selectedMonth}
                  anno={selectedYear}
                  onKmCalculated={handleKmCalculated}
                  onOreCalculated={handleOreCalculated}
                  size="sm"
                />
              )}
            </div>

            {/* Sezione 2 - Dati calcolo */}
            {selectedUser && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Dati Calcolo</h3>
                
                {selectedUser.role === 'socio' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="km"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KM *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={12}
                              step={5}
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ore_attesa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ore Attesa</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {(selectedUser.role === 'dipendente' || selectedUser.role === 'admin') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ore_lavorate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ore Lavorate *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tariffa_oraria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tariffa Oraria €</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sezione 3 - Preview calcolo */}
            {selectedUser?.role === 'socio' && watchedValues.km && watchedValues.km >= 12 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Preview Calcolo</h3>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Calcolo Stipendio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isCalculating ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Calcolando...</span>
                      </div>
                    ) : calcolo ? (
                      <>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base KM:</span>
                            <span>€{calcolo.baseKm.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aumento 17%:</span>
                            <span>€{(calcolo.baseConAumento - calcolo.baseKm).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ore attesa:</span>
                            <span>€{calcolo.importoOreAttesa.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span>= Lordo:</span>
                            <span>€{calcolo.totaleLordo.toFixed(2)}</span>
                          </div>
                          
                          {calcolo.detrazioni && (
                            <>
                              <div className="flex justify-between text-red-600">
                                <span>Spese:</span>
                                <span>-€{calcolo.detrazioni.totaleSpesePersonali.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Prelievi:</span>
                                <span>-€{calcolo.detrazioni.totalePrelievi.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Incassi:</span>
                                <span>+€{calcolo.detrazioni.incassiDaDipendenti.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Riporto:</span>
                                <span>+€{calcolo.detrazioni.riportoMesePrecedente.toFixed(2)}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>= NETTO:</span>
                                <span>€{calcolo.totaleNetto.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Inserisci i dati per vedere il calcolo
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {(selectedUser?.role === 'dipendente' || selectedUser?.role === 'admin') && watchedValues.ore_lavorate && watchedValues.tariffa_oraria && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Preview Calcolo</h3>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Calcolo Stipendio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ore lavorate:</span>
                        <span>{watchedValues.ore_lavorate}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tariffa oraria:</span>
                        <span>€{watchedValues.tariffa_oraria.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>= LORDO:</span>
                        <span>€{(watchedValues.ore_lavorate * watchedValues.tariffa_oraria).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sezione 4 - Note */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Note (opzionale)</h3>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note aggiuntive</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Inserisci eventuali note..."
                        className="resize-none"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva come bozza
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
