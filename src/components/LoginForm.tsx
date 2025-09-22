import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
    <div className="mx-5 max-w-sm sm:max-w-md w-full bg-white/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl">
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

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <input
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
              border rounded-lg
              bg-background text-foreground
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
              transition-all duration-200
              min-h-[48px]
              ${emailError ? 'border-destructive' : 'border-border'}
            `}
            style={{
              fontSize: '16px',
              minHeight: '48px',
              WebkitTextSizeAdjust: '100%'
            }}
            disabled={isAuthenticating}
            autoComplete="email"
            inputMode="email"
          />
          {emailError && (
            <p className="text-xs text-destructive animate-fade-in">{emailError}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <input
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
                w-full px-4 py-3 pr-12 text-base
                border rounded-lg
                bg-background text-foreground
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                transition-all duration-200
                min-h-[48px]
                ${passwordError ? 'border-destructive' : 'border-border'}
              `}
              style={{
                fontSize: '16px',
                minHeight: '48px',
                WebkitTextSizeAdjust: '100%'
              }}
              disabled={isAuthenticating}
              autoComplete="current-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px'
              }}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isAuthenticating}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>
          {passwordError && (
            <p className="text-xs text-destructive animate-fade-in">{passwordError}</p>
          )}
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center touch-manipulation">
          <label 
            htmlFor="rememberMe" 
            className="flex items-center cursor-pointer text-foreground"
            style={{ padding: '12px', margin: '-12px' }}
          >
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="w-5 h-5 mr-3"
              disabled={isAuthenticating}
            />
            <span className="text-sm font-medium">Ricorda credenziali</span>
          </label>
        </div>

        {/* Login button */}
        <Button 
          type="submit" 
          className="w-full py-3.5 px-4 text-base font-semibold min-h-[48px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center touch-manipulation" 
          disabled={loading || isAuthenticating || (lockoutTime && lockoutTime > Date.now())}
        >
          {loading || isAuthenticating ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              <span>{isAuthenticating ? 'Autenticazione...' : 'Accesso in corso...'}</span>
            </div>
          ) : lockoutTime && lockoutTime > Date.now() ? (
            <span>Account bloccato</span>
          ) : (
            <div className="flex items-center">
              <LogIn className="mr-2 h-5 w-5" />
              <span>Accedi</span>
            </div>
          )}
        </Button>
        
        {/* Footer links */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <RecuperaPasswordDialog>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm font-medium py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                disabled={isAuthenticating}
              >
                Recupera password
              </Button>
            </RecuperaPasswordDialog>
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium py-2 px-4 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
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
    </div>
  );
}