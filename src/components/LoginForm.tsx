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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-8">
      <div className="max-w-md mx-auto">
        
        {/* LOGO E TITOLI - UNA VOLTA SOLA */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Benvenuto</h1>
          <p className="text-gray-600 mt-1">Accedi al tuo account</p>
        </div>

        {/* CARD BIANCA - QUI VA TUTTO IL FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Progressive Loading Bar */}
            {isAuthenticating && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
                <div 
                  className="login-progress h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${authProgress}%` }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                style={{
                  fontSize: '16px !important',
                  minHeight: '48px !important',
                  WebkitTextSizeAdjust: '100%',
                  WebkitAppearance: 'none',
                  zoom: 'normal'
                }}
                disabled={isAuthenticating}
                autoComplete="email"
                inputMode="email"
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                  style={{
                    fontSize: '16px !important',
                    minHeight: '48px !important',
                    WebkitTextSizeAdjust: '100%',
                    WebkitAppearance: 'none',
                    zoom: 'normal'
                  }}
                  disabled={isAuthenticating}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  style={{
                    width: '44px !important',
                    height: '44px !important',
                    minWidth: '44px !important',
                    minHeight: '44px !important'
                  }}
                  disabled={isAuthenticating}
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            {/* Remember me */}
            <label 
              htmlFor="rememberMe" 
              className="flex items-center cursor-pointer"
              style={{ 
                padding: '16px !important', 
                margin: '-16px !important',
                minHeight: '44px !important',
                minWidth: '44px !important'
              }}
            >
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 mr-3 cursor-pointer"
                disabled={isAuthenticating}
              />
              <span className="text-sm text-gray-700">Ricorda credenziali</span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || isAuthenticating || (lockoutTime && lockoutTime > Date.now())}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 min-h-[48px] flex items-center justify-center"
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
            </button>

            {/* Links */}
            <div className="flex justify-between items-center text-sm pt-4">
              <RecuperaPasswordDialog>
                <button 
                  type="button"
                  className="text-blue-600 hover:underline"
                  disabled={isAuthenticating}
                >
                  Recupera password
                </button>
              </RecuperaPasswordDialog>
              <Link to="/assistenza" className="text-gray-500 hover:underline flex items-center">
                <HelpCircle className="mr-1 h-4 w-4" /> 
                Assistenza  
              </Link>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">Sicuro e veloce</p>
        </div>

      </div>
    </div>
  );

}