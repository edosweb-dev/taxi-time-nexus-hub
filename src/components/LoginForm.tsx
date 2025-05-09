
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, HelpCircle, Mail } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

export function LoginForm() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, loading } = useAuth();

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const rememberedState = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberedEmail && rememberedPassword && rememberedState) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save or remove credentials based on rememberMe state
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberedPassword', password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.setItem('rememberMe', 'false');
    }
    
    await signIn(email, password);
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-taxitime-100">
      <CardHeader className="space-y-1 flex items-center justify-center pb-0">
        <div className="flex justify-center mb-6 mt-2">
          <img 
            src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
            alt="Taxitime Logo" 
            className="h-28 w-28 object-contain"
          />
        </div>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-5 pt-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
              Ricorda credenziali
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-taxitime-600 hover:bg-taxitime-700" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span> Accesso in corso...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Accedi
              </>
            )}
          </Button>
          
          <div className="flex w-full justify-between text-sm">
            <Button variant="link" size="sm" className="text-taxitime-600 hover:text-taxitime-800 px-0">
              <Mail className="mr-1 h-3.5 w-3.5" /> Recupera password
            </Button>
            <Button variant="link" size="sm" className="text-taxitime-600 hover:text-taxitime-800 px-0">
              <HelpCircle className="mr-1 h-3.5 w-3.5" /> Richiedi assistenza
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
