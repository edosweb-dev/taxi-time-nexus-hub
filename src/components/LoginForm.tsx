
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    
    console.log('[LoginForm] Tentativo di login con:', { 
      email, 
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });
    
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
    
    try {
      await signIn(email, password);
      console.log('[LoginForm] SignIn completato senza errori');
    } catch (error) {
      console.error('[LoginForm] Errore durante signIn:', error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nome@azienda.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer text-foreground">
          Ricorda credenziali
        </Label>
      </div>

      <Button 
        type="submit" 
        className="w-full h-10 font-medium" 
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span> 
            Accesso in corso...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" /> Accedi
          </>
        )}
      </Button>
      
      <div className="flex justify-between text-sm pt-4 border-t border-border">
        <RecuperaPasswordDialog>
          <Button variant="link" size="sm" className="px-0 h-auto font-normal">
            Recupera password
          </Button>
        </RecuperaPasswordDialog>
        <Button asChild variant="link" size="sm" className="px-0 h-auto font-normal">
          <Link to="/assistenza">
            <HelpCircle className="mr-1 h-3.5 w-3.5" /> Assistenza
          </Link>
        </Button>
      </div>
    </form>
  );
}
