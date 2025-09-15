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
    <form onSubmit={handleLogin} className="space-y-6 login-form auth-enter">
      {/* Progressive Loading Bar */}
      {isAuthenticating && (
        <div className="w-full bg-muted/30 rounded-full h-1.5 mb-6 overflow-hidden">
          <div 
            className="login-progress h-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
            style={{ width: `${authProgress}%` }}
          />
        </div>
      )}

      {/* Email Field - Enhanced mobile design */}
      <div className="space-y-3">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email
        </Label>
        <div className="relative">
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
              w-full px-4 py-3 text-base
              border-2 rounded-xl
              focus:ring-0 focus:border-primary
              transition-all duration-200
              min-h-[52px]
              ${emailError ? 'border-destructive form-field-error' : 'border-border hover:border-primary/50'}
            `}
            disabled={isAuthenticating}
            autoComplete="email"
            inputMode="email"
          />
          {emailError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
              </div>
            </div>
          )}
        </div>
        {emailError && (
          <p className="text-xs text-destructive animate-fade-in flex items-center gap-2 mt-2">
            <span className="w-1 h-1 rounded-full bg-destructive"></span>
            {emailError}
          </p>
        )}
      </div>

      {/* Password Field - Enhanced mobile design */}
      <div className="space-y-3">
        <Label htmlFor="password" className="text-sm font-semibold text-foreground">
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
              w-full px-4 py-3 pr-14 text-base
              border-2 rounded-xl
              focus:ring-0 focus:border-primary
              transition-all duration-200
              min-h-[52px]
              ${passwordError ? 'border-destructive form-field-error' : 'border-border hover:border-primary/50'}
            `}
            disabled={isAuthenticating}
            autoComplete="current-password"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {passwordError && (
              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-primary/20 focus:rounded-lg min-h-[44px] min-w-[44px] hover:bg-muted/50"
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
        </div>
        {passwordError && (
          <p className="text-xs text-destructive animate-fade-in flex items-center gap-2 mt-2">
            <span className="w-1 h-1 rounded-full bg-destructive"></span>
            {passwordError}
          </p>
        )}
      </div>

      {/* Remember me checkbox - Refined design */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="w-5 h-5 cursor-pointer border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            disabled={isAuthenticating}
          />
          <Label 
            htmlFor="rememberMe" 
            className="ml-3 text-sm font-medium cursor-pointer text-foreground select-none"
          >
            Ricorda credenziali
          </Label>
        </div>
        {loginAttempts > 0 && lockoutTime && lockoutTime <= Date.now() && (
          <span className="text-xs text-muted-foreground">
            {3 - loginAttempts} tentativi rimasti
          </span>
        )}
      </div>

      {/* Enhanced login button */}
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full py-4 px-6 text-base font-semibold min-h-[56px] rounded-xl bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-primary/20 flex items-center justify-center focus:ring-4 focus:ring-primary/30" 
          disabled={loading || isAuthenticating || (lockoutTime && lockoutTime > Date.now())}
        >
          {loading || isAuthenticating ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              <span>{isAuthenticating ? 'Autenticazione...' : 'Accesso in corso...'}</span>
            </div>
          ) : lockoutTime && lockoutTime > Date.now() ? (
            <div className="flex items-center text-muted-foreground">
              <span>Account temporaneamente bloccato</span>
            </div>
          ) : (
            <div className="flex items-center">
              <LogIn className="mr-3 h-5 w-5" />
              <span>Accedi</span>
            </div>
          )}
        </Button>
      </div>
      
      {/* Elegant footer links */}
      <div className="pt-8 border-t border-border/50">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <RecuperaPasswordDialog>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px] focus:ring-2 focus:ring-primary/20"
              disabled={isAuthenticating}
            >
              Recupera password
            </Button>
          </RecuperaPasswordDialog>
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="text-sm font-medium py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px] focus:ring-2 focus:ring-primary/20"
            disabled={isAuthenticating}
          >
            <Link to="/assistenza" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" /> 
              Assistenza
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}