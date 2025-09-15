import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { RecuperaPasswordDialog } from './RecuperaPasswordDialog';

export function LoginForm() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const { signIn, loading } = useAuth();

  // Load only remembered email (security fix - never store passwords)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedState = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberedEmail && rememberedState) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    
    // Clear any previously stored passwords (security cleanup)
    localStorage.removeItem('rememberedPassword');
  }, []);

  // Real-time validation functions
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email richiesta';
    if (!emailRegex.test(email)) return 'Email non valida';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password richiesta';
    if (password.length < 6) return 'Password troppo corta (min 6 caratteri)';
    return null;
  };

  // Progressive authentication with rate limiting
  const simulateAuthProgress = () => {
    setAuthProgress(0);
    const progressInterval = setInterval(() => {
      setAuthProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    return progressInterval;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check lockout
    if (lockoutTime && lockoutTime > Date.now()) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 60000);
      toast.error(`Troppi tentativi. Riprova tra ${remainingTime} minuti.`);
      return;
    }

    // Validate form
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    // Clear errors and start authentication
    setEmailError(null);
    setPasswordError(null);
    setIsAuthenticating(true);
    
    const progressInterval = simulateAuthProgress();
    
    // Save only email if remember me is checked (security fix)
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.setItem('rememberMe', 'false');
    }
    
    try {
      await signIn(email, password);
      setAuthProgress(100);
      setLoginAttempts(0); // Reset on success
      setLockoutTime(null);
    } catch (error) {
      console.error('[LoginForm] Errore durante signIn:', error);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setLockoutTime(Date.now() + 5 * 60 * 1000); // 5 min lockout
        toast.error('Troppi tentativi falliti. Account bloccato per 5 minuti.');
      }
      
      clearInterval(progressInterval);
      setAuthProgress(0);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 login-form auth-enter">
      {/* Progressive Loading Bar */}
      {isAuthenticating && (
        <div className="w-full bg-secondary rounded-full h-1 mb-4 overflow-hidden">
          <div 
            className="login-progress h-1 rounded-full transition-all duration-300"
            style={{ width: `${authProgress}%` }}
          />
        </div>
      )}

      {/* Email Field - Mobile Optimized */}
      <div className="space-y-2">
        <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nome@azienda.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={() => {
            const error = validateEmail(email);
            setEmailError(error);
          }}
          className={`
            w-full px-4 py-4 text-base
            border rounded-lg
            focus:ring-2 focus:ring-ring focus:border-transparent
            transition-all duration-200
            min-h-[56px]
            ${emailError ? 'border-destructive form-field-error' : 'border-input'}
          `}
          disabled={isAuthenticating}
          autoComplete="email"
          inputMode="email"
        />
        {emailError && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{emailError}</p>
        )}
      </div>

      {/* Password Field - Mobile Optimized */}
      <div className="space-y-2">
        <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            onBlur={() => {
              const error = validatePassword(password);
              setPasswordError(error);
            }}
            className={`
              w-full px-4 py-4 pr-12 text-base
              border rounded-lg
              focus:ring-2 focus:ring-ring focus:border-transparent
              transition-all duration-200
              min-h-[56px]
              ${passwordError ? 'border-destructive form-field-error' : 'border-input'}
            `}
            disabled={isAuthenticating}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring focus:rounded min-h-[44px] min-w-[44px]"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isAuthenticating}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
        {passwordError && (
          <p className="text-xs text-destructive animate-fade-in mt-1">{passwordError}</p>
        )}
      </div>

      {/* Remember me checkbox - Mobile optimized */}
      <div className="flex items-center py-2">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          className="w-5 h-5 cursor-pointer"
          disabled={isAuthenticating}
        />
        <Label 
          htmlFor="rememberMe" 
          className="ml-3 text-sm font-normal cursor-pointer text-foreground select-none"
        >
          Ricorda credenziali
        </Label>
      </div>

      {/* Login button - Mobile optimized */}
      <Button 
        type="submit" 
        className="w-full py-4 px-6 text-base font-semibold min-h-[56px] transition-all duration-200 hover:scale-[1.02] flex items-center justify-center focus:ring-4 focus:ring-ring/30" 
        disabled={loading || isAuthenticating || (lockoutTime && lockoutTime > Date.now())}
      >
        {loading || isAuthenticating ? (
          <>
            <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span> 
            {isAuthenticating ? 'Autenticazione...' : 'Accesso in corso...'}
          </>
        ) : lockoutTime && lockoutTime > Date.now() ? (
          <>
            Account bloccato
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-5 w-5" /> Accedi
          </>
        )}
      </Button>
      
      {/* Footer links - Mobile optimized */}
      <div className="pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <RecuperaPasswordDialog>
            <Button 
              variant="link" 
              size="sm" 
              className="px-1 h-auto font-medium text-base py-2 min-h-[44px] focus:ring-2 focus:ring-ring"
              disabled={isAuthenticating}
            >
              Recupera password
            </Button>
          </RecuperaPasswordDialog>
          <Button 
            asChild 
            variant="link" 
            size="sm" 
            className="px-1 h-auto font-medium text-base py-2 min-h-[44px] focus:ring-2 focus:ring-ring"
            disabled={isAuthenticating}
          >
            <Link to="/assistenza" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" /> Assistenza
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}