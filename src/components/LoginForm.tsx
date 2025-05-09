
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/lib/types';

export function LoginForm() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, loading } = useAuth();
  const [registering, setRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Registrazione effettuata con successo! Controlla la tua email per confermare l\'account.');
      setActiveTab('login');
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error(error.message || 'Errore durante la registrazione');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Account</CardTitle>
        <CardDescription className="text-center">
          Accedi o registrati per continuare
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Accesso</TabsTrigger>
            <TabsTrigger value="register">Registrazione</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@azienda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="px-0 font-normal h-auto text-xs">
                    Password dimenticata?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-taxitime-600 hover:bg-taxitime-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="nome@azienda.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="socio">Socio</SelectItem>
                    <SelectItem value="dipendente">Dipendente</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registering}
              >
                {registering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrazione in corso...
                  </>
                ) : (
                  'Registrati'
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
