
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, HelpCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <Card className="w-full shadow-2xl border-taxitime-200 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 flex items-center justify-center pb-2">
        <div className="flex justify-center mb-8 mt-4">
          <img 
            src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
            alt="Taxitime Logo" 
            className="h-32 w-32 object-contain drop-shadow-md"
          />
        </div>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-taxitime-800 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@azienda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-taxitime-800 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="border-taxitime-400 data-[state=checked]:bg-taxitime-600"
            />
            <Label htmlFor="rememberMe" className="font-normal cursor-pointer text-taxitime-700">
              Ricorda credenziali
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 pb-8">
          <Button 
            type="submit" 
            className="w-full bg-taxitime-600 hover:bg-taxitime-700 text-white transition-colors text-base py-6" 
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
            <Button asChild variant="link" size="sm" className="text-taxitime-600 hover:text-taxitime-800 px-0 font-medium">
              <Link to="/recupera-password">
                <Mail className="mr-1 h-3.5 w-3.5" /> Recupera password
              </Link>
            </Button>
            <Button asChild variant="link" size="sm" className="text-taxitime-600 hover:text-taxitime-800 px-0 font-medium">
              <Link to="/assistenza">
                <HelpCircle className="mr-1 h-3.5 w-3.5" /> Richiedi assistenza
              </Link>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
