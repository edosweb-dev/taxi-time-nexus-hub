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
      {/* Enhanced Card with glassmorphism */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 p-6 sm:p-8 mx-4 relative overflow-hidden">
        {/* Subtle card accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
        
        <form onSubmit={handleLogin} className="space-y-6" aria-label="Form di accesso">
            
          {/* Enhanced Progressive Loading Bar */}
          {isAuthenticating && (
            <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden shadow-inner">
              <div 
                className="login-progress h-2 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${authProgress}%` }}
              />
            </div>
          )}

          {/* Enhanced Email Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-foreground mb-3 group-focus-within:text-primary transition-colors">
              Email
            </label>
            <div className="relative">
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
                className={`w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-0 focus:border-primary text-base bg-background/50 text-foreground transition-all duration-300 hover:border-border/80 ${emailError ? 'border-destructive focus:border-destructive bg-destructive/5' : 'focus:bg-background'}`}
                disabled={isAuthenticating}
                autoComplete="email"
                inputMode="email"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {emailError && (
              <div className="mt-2 flex items-center space-x-2 animate-shake">
                <div className="w-1 h-1 bg-destructive rounded-full"></div>
                <p className="text-destructive text-sm font-medium" role="alert" aria-live="polite">{emailError}</p>
              </div>
            )}
          </div>

          {/* Enhanced Password Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-foreground mb-3 group-focus-within:text-primary transition-colors">
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
                className={`w-full px-4 py-4 pr-14 border-2 border-border rounded-xl focus:outline-none focus:ring-0 focus:border-primary text-base bg-background/50 text-foreground transition-all duration-300 hover:border-border/80 ${passwordError ? 'border-destructive focus:border-destructive bg-destructive/5' : 'focus:bg-background'}`}
                disabled={isAuthenticating}
                autoComplete="current-password"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none min-h-touch min-w-touch flex items-center justify-center transition-colors duration-200 rounded-lg hover:bg-primary/10"
                disabled={isAuthenticating}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError && (
              <div className="mt-2 flex items-center space-x-2 animate-shake">
                <div className="w-1 h-1 bg-destructive rounded-full"></div>
                <p className="text-destructive text-sm font-medium" role="alert" aria-live="polite">{passwordError}</p>
              </div>
            )}
          </div>

          {/* Enhanced Remember Me */}
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                  disabled={isAuthenticating}
                />
                <div className={`w-4 h-4 border-2 rounded transition-all duration-200 ${rememberMe ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'} group-hover:scale-110`}>
                  {rememberMe && (
                    <svg className="w-3 h-3 text-primary-foreground transform scale-75 translate-x-0.5 translate-y-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                Ricorda email
              </span>
            </label>
          </div>

          {/* Enhanced Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAuthenticating || loading || lockoutTime !== null && lockoutTime > Date.now()}
              aria-busy={isAuthenticating || loading}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-4 px-8 rounded-xl hover:from-primary/90 hover:to-primary disabled:from-muted disabled:to-muted disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:shadow-none"
            >
            {loading || isAuthenticating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>{isAuthenticating ? 'Autenticazione in corso...' : 'Accesso in corso...'}</span>
              </div>
            ) : lockoutTime && lockoutTime > Date.now() ? (
              <div className="flex items-center justify-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                <span>Account temporaneamente bloccato</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="mr-3 h-5 w-5" />
                <span>Accedi al tuo account</span>
              </div>
            )}
            </button>
          </div>

          {/* Enhanced Links section */}
          <div className="text-center space-y-4 pt-6 border-t border-border/50">
            <RecuperaPasswordDialog>
              <button 
                type="button" 
                className="text-primary hover:text-primary/80 text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-105"
                disabled={isAuthenticating}
              >
                Password dimenticata?
              </button>
            </RecuperaPasswordDialog>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>Problemi di accesso?</span>
              <button 
                type="button" 
                className="text-primary hover:text-primary/80 font-medium py-1 px-2 rounded hover:bg-primary/10 transition-all duration-200"
                onClick={() => console.log('Contatta assistenza')}
                disabled={isAuthenticating}
              >
                Contatta l'assistenza
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}