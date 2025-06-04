
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecuperaPasswordDialog } from './RecuperaPasswordDialog';

export function LoginForm() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
      <CardHeader className="pb-2">
        <h1 className="text-2xl font-bold text-center text-taxitime-800">Accedi a Taxitime</h1>
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
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
            <RecuperaPasswordDialog>
              <Button variant="link" size="sm" className="text-taxitime-600 hover:text-taxitime-800 px-0 font-medium">
                <span className="mr-1 h-3.5 w-3.5">🔑</span> Recupera password
              </Button>
            </RecuperaPasswordDialog>
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
