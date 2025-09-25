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
      {/* CARD BIANCA - CONTENUTO DEL FORM */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-6 mx-4">
        <form onSubmit={handleLogin} className="space-y-4" aria-label="Form di accesso">
            
          {/* Progressive Loading Bar */}
          {isAuthenticating && (
            <div className="w-full bg-muted rounded-full h-1.5 mb-4 overflow-hidden">
              <div 
                className="login-progress h-1.5 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${authProgress}%` }}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
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
              className={`w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-base bg-background text-foreground ${emailError ? 'border-destructive form-field-error' : ''}`}
              disabled={isAuthenticating}
              autoComplete="email"
              inputMode="email"
            />
            {emailError && (
              <p className="text-destructive text-sm mt-1" role="alert" aria-live="polite">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                onBlur={() => {
                  const error = validatePassword(password);
                  setPasswordError(error);
                }}
                className={`w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring pr-12 text-base bg-background text-foreground ${passwordError ? 'border-destructive form-field-error' : ''}`}
                disabled={isAuthenticating}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none min-h-touch min-w-touch flex items-center justify-center"
                disabled={isAuthenticating}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-destructive text-sm mt-1" role="alert" aria-live="polite">{passwordError}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center p-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3 w-3 text-primary focus:ring-ring border-border rounded cursor-pointer"
                disabled={isAuthenticating}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground cursor-pointer">
                Ricorda email
              </label>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={isAuthenticating || loading || lockoutTime !== null && lockoutTime > Date.now()}
              aria-busy={isAuthenticating || loading}
              className="bg-primary text-primary-foreground py-3 px-8 rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors duration-200 font-medium text-base min-h-touch min-w-[200px]"
            >
            {loading || isAuthenticating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>{isAuthenticating ? 'Autenticazione...' : 'Accesso in corso...'}</span>
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
          </div>

          {/* Links utili */}
          <div className="text-center space-y-3 pt-4">
            <RecuperaPasswordDialog>
              <button 
                type="button" 
                className="text-primary hover:text-primary/80 text-sm underline py-2 px-1 inline-block min-h-touch flex items-center mx-auto"
                disabled={isAuthenticating}
              >
                Password dimenticata?
              </button>
            </RecuperaPasswordDialog>
            
            <p className="text-xs text-muted-foreground">
              Problemi di accesso?{" "}
              <button 
                type="button" 
                className="text-primary hover:text-primary/80 underline py-2 px-1 inline-block min-h-touch"
                onClick={() => console.log('Contatta assistenza')}
                disabled={isAuthenticating}
              >
                Assistenza
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}