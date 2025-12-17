import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
    } catch (error: any) {
      console.error('[LoginForm] Errore durante signIn:', error);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Enhanced error handling with better user messages
      let errorMessage = 'Si è verificato un errore. Riprova';
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o password non corretti';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Troppi tentativi. Riprova tra 5 minuti';
        } else if (error.message.includes('refresh token')) {
          errorMessage = 'Sessione scaduta, riprova';
        }
      }
      
      toast.error(errorMessage);
      
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
    <div className="w-full mx-auto overflow-hidden">
      {/* Card with glassmorphism - compact */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl shadow-primary/10 p-4 sm:p-6 relative overflow-hidden">
        {/* Card accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
        
        <form onSubmit={handleLogin} className="space-y-4" aria-label="Form di accesso">
            
          {/* Progressive Loading Bar */}
          {isAuthenticating && (
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="login-progress h-1.5 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-500 ease-out"
                style={{ width: `${authProgress}%` }}
              />
            </div>
          )}

          {/* Email Field - Compact */}
          <div className="group">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
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
              className={`w-full px-3 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary text-base bg-background/50 text-foreground transition-colors ${emailError ? 'border-destructive bg-destructive/5' : ''}`}
              disabled={isAuthenticating}
              autoComplete="email"
              inputMode="email"
            />
            {emailError && (
              <p className="text-destructive text-xs mt-1 font-medium">{emailError}</p>
            )}
          </div>

          {/* Password Field - Compact */}
          <div className="group">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Inserisci la tua password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                onBlur={() => {
                  const error = validatePassword(password);
                  setPasswordError(error);
                }}
                className={`w-full px-3 py-3 pr-12 border-2 border-border rounded-lg focus:outline-none focus:border-primary text-base bg-background/50 text-foreground transition-colors ${passwordError ? 'border-destructive bg-destructive/5' : ''}`}
                disabled={isAuthenticating}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary p-1 rounded"
                disabled={isAuthenticating}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-destructive text-xs mt-1 font-medium">{passwordError}</p>
            )}
          </div>

          {/* Remember Me - Compact */}
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
              disabled={isAuthenticating}
            />
            <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border-border'}`}>
              {rememberMe && (
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm text-foreground">Ricorda email</span>
          </label>

          {/* Submit button - min 44px touch target */}
          <button
            type="submit"
            disabled={isAuthenticating || loading || (lockoutTime !== null && lockoutTime > Date.now())}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors font-semibold text-base min-h-[44px]"
          >
            {loading || isAuthenticating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Accesso...</span>
              </div>
            ) : lockoutTime && lockoutTime > Date.now() ? (
              <span>Account bloccato</span>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5" />
                <span>Accedi</span>
              </div>
            )}
          </button>

          {/* Links section - Compact */}
          <div className="text-center pt-2 border-t border-border/50">
            <RecuperaPasswordDialog>
              <button 
                type="button" 
                className="text-primary hover:text-primary/80 text-sm font-medium py-2 px-3 min-h-[44px]"
                disabled={isAuthenticating}
              >
                Password dimenticata?
              </button>
            </RecuperaPasswordDialog>
          </div>

        </form>
      </div>
    </div>
  );
}